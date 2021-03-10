import React, { useState, useMemo } from 'react'
import { JSBI } from '@venomswap/sdk'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonError } from '../Button'
import { usePitBreederContract } from '../../hooks/useContract'
import { SubmittedView, LoadingView } from '../ModalViews'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useActiveWeb3React } from '../../hooks'
import { calculateGasMargin } from '../../utils'
import { STAKING_REWARDS_INFO } from '../../constants/staking'
import { useBlockNumber } from '../../state/application/hooks'
import useBlockchain from '../../hooks/useBlockchain'
import getBlockchainBlockTime from '../../utils/getBlockchainBlockTime'
import { BlueCard } from '../Card'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface ClaimModalProps {
  isOpen: boolean
  onDismiss: () => void
}

const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

export default function ClaimModal({ isOpen, onDismiss }: ClaimModalProps) {
  const { account, chainId } = useActiveWeb3React()

  const blockchain = useBlockchain()
  const blockTime = getBlockchainBlockTime(blockchain)

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  const rewardsStartBlock = 10271502
  const currentBlock = useBlockNumber()

  const rewardsStarted = useMemo<boolean>(() => {
    return rewardsStartBlock && currentBlock
      ? JSBI.greaterThanOrEqual(JSBI.BigInt(currentBlock), JSBI.BigInt(rewardsStartBlock))
      : false
  }, [rewardsStartBlock, currentBlock])

  const blocksLeftUntilRewards = useMemo<number>(() => {
    return rewardsStartBlock && currentBlock ? rewardsStartBlock - currentBlock : 0
  }, [rewardsStartBlock, currentBlock])

  const secondsToRewards = !rewardsStarted ? blocksLeftUntilRewards * blockTime : 0
  let startingAt = secondsToRewards
  const days = (startingAt - (startingAt % DAY)) / DAY
  startingAt -= days * DAY
  const hours = (startingAt - (startingAt % HOUR)) / HOUR
  startingAt -= hours * HOUR
  const minutes = (startingAt - (startingAt % MINUTE)) / MINUTE
  startingAt -= minutes * MINUTE
  const seconds = startingAt

  console.log({ currentBlock, rewardsStarted, blocksLeftUntilRewards })

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const pitBreeder = usePitBreederContract()
  const stakingPools = chainId ? STAKING_REWARDS_INFO[chainId] : []
  const claimFrom: string[] = []
  const claimTo: string[] = []

  if (stakingPools) {
    for (const pool of stakingPools) {
      claimFrom.push(pool.tokens[0].address)
      claimTo.push(pool.tokens[1].address)
    }
  }

  async function onClaimRewards() {
    if (pitBreeder) {
      setAttempting(true)

      const estimatedGas = await pitBreeder.estimateGas.convertMultiple(claimFrom, claimTo)

      await pitBreeder
        .convertMultiple(claimFrom, claimTo, {
          gasLimit: calculateGasMargin(estimatedGas)
        })
        .then((response: TransactionResponse) => {
          console.log({ response })
          addTransaction(response, {
            summary: `Claim ViperPit rewards`
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader> Claim</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <TYPE.body fontSize={32} style={{ textAlign: 'center' }}>
            <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
              💎
            </span>
          </TYPE.body>
          {rewardsStarted && (
            <>
            <TYPE.body fontSize={14} style={{ textAlign: 'center' }}>
              When you claim rewards, collected LP fees will be used to market buy VIPER.
              <br /><br />
              The purchased VIPER tokens will then be distributed to the ViperPit stakers as a reward.
            </TYPE.body>
            <ButtonError disabled={!!error} error={!!error} onClick={onClaimRewards}>
              {error ?? 'Claim'}
            </ButtonError>
            </>
          )}
          {!rewardsStarted && (
            <BlueCard>
              <AutoColumn gap="10px">
                <TYPE.body fontSize={14} style={{ textAlign: 'center' }}>
                  The ViperPit claim rewards feature is expected to go live at block number <b>{rewardsStartBlock}</b>.
                  <br /><br />
                  Expected start: <b>
                  {days ? `${days} ${days === 1 ? 'day' : 'days'}, ` : ''}
                  {hours ? `${hours} ${hours === 1 ? 'hour' : 'hours'}, ` : ''}
                  {minutes ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ` : ''}
                  {seconds ? `${minutes && minutes > 0 ? 'and ' : ''}${seconds} ${seconds === 1 ? 'second' : 'seconds'}` : ''}
                  </b> from now.
                </TYPE.body>
              </AutoColumn>
            </BlueCard>
          )}
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Claiming ViperPit rewards</TYPE.body>
            <TYPE.body fontSize={12}>
              (MetaMask window might take a while to appear &mdash;
              <br />
              please be patient)
            </TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Claimed VIPER!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
