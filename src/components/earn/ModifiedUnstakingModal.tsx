import React, { useState, useCallback } from 'react'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonError } from '../Button'
import CurrencyInputPanel from '../CurrencyInputPanel'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { TokenAmount, Pair } from '@viperswap/sdk'
import { StakingInfo, useDerivedUnstakeInfo } from '../../state/stake/hooks'
//import { wrappedCurrencyAmount } from '../../utils/wrappedCurrency'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { LoadingView, SubmittedView } from '../ModalViews'
import { useMasterBreederContract } from '../../hooks/useContract'
import { ZERO_ADDRESS } from '../../constants'
import { BlueCard } from '../Card'
import { ColumnCenter } from '../Column'
import { calculateGasMargin } from '../../utils'

/*const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
  padding-left: 20px;

  opacity: ${({ dim }) => (dim ? 0.5 : 1)};
`*/

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo
}

export default function ModifiedStakingModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedUnstakeInfo(typedValue, stakingInfo.stakedAmount)
  /*const parsedAmountWrapped = wrappedCurrencyAmount(parsedAmount, chainId)

  let hypotheticalRewardRate: TokenAmount = new TokenAmount(stakingInfo.rewardRate.token, '0')
  if (parsedAmountWrapped?.greaterThan('0')) {
    hypotheticalRewardRate = stakingInfo.getHypotheticalRewardRate(
      stakingInfo.stakedAmount.add(parsedAmountWrapped),
      stakingInfo.totalStakedAmount.add(parsedAmountWrapped),
      stakingInfo.totalRewardRate
    )
  }*/

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])

  const masterBreeder = useMasterBreederContract()
  const referral = ZERO_ADDRESS

  // pair contract for this token to be staked
  const dummyPair = new Pair(new TokenAmount(stakingInfo.tokens[0], '0'), new TokenAmount(stakingInfo.tokens[1], '0'))

  async function onWithdraw() {
    if (masterBreeder && stakingInfo?.stakedAmount) {
      setAttempting(true)

      const formattedAmount = `0x${parsedAmount?.raw.toString(16)}`
      const estimatedGas = await masterBreeder.estimateGas.withdraw(stakingInfo.pid, formattedAmount, referral)

      await masterBreeder
        .withdraw(stakingInfo.pid, formattedAmount, referral, {
          gasLimit: calculateGasMargin(estimatedGas)
        })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw deposited liquidity`
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(stakingInfo.stakedAmount)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))

  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Withdraw</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>

          <RowBetween>
            <ColumnCenter>
              <BlueCard>
                <AutoColumn gap="10px">
                  <TYPE.link fontWeight={400} color={'primaryText1'}>
                    <b>Important:</b> Viperswap utilizes LP withdrawal fees to disincentivize short term farming and selling.
                    <br />
                    <br />
                    Standard withdrawal fees range from 0.1% - 0.5%.
                  </TYPE.link>
                  <TYPE.link fontWeight={400} fontSize={12} color={'primaryText1'}>
                    <b>Extra penalties will apply for the following conditions:</b>
                    <ul>
                      <li>1% fee if a user withdraws under 5 days</li>
                      <li>2% fee if a user withdraws under 3 days.</li>
                      <li>4% fee if a user withdraws under 24 hours.</li>
                      <li>8% fee if a user withdraws under 1 hour.</li>
                      <li>25% slashing fee if a user withdraws during the same block (in order to disincentivize the use of flash loans).</li>
                    </ul>
                  </TYPE.link>
                </AutoColumn>
              </BlueCard>
            </ColumnCenter>
          </RowBetween>

          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={stakingInfo.stakedAmount.token}
            pair={dummyPair}
            label={''}
            disableCurrencySelect={true}
            overrideSelectedCurrencyBalance={stakingInfo.stakedAmount}
            customBalanceText={'Available to withdraw: '}
            id="stake-liquidity-token"
          />

          <RowBetween>
            <ButtonError disabled={!!error} error={!!error && !!parsedAmount} onClick={onWithdraw}>
              {error ?? 'Withdraw'}
            </ButtonError>
          </RowBetween>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Withdrawing Liquidity</TYPE.largeHeader>
            <TYPE.body fontSize={20}>{parsedAmount?.toSignificant(4)} VIPER-LP</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Withdraw {parsedAmount?.toSignificant(4)} VIPER-LP</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
