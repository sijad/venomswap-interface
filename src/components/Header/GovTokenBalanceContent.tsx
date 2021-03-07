import { ChainId, TokenAmount } from '@venomswap/sdk'
import React from 'react'
//import React, { useMemo } from 'react'
import { X } from 'react-feather'
import styled from 'styled-components'
import tokenLogo from '../../assets/images/token-logo.png'
import { GOVERNANCE_TOKEN } from '../../constants'
import { useGovTokenSupply } from '../../data/TotalSupply'
import { useActiveWeb3React } from '../../hooks'
//import { useMerkleDistributorContract } from '../../hooks/useContract'
//import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { useTotalLockedGovTokensEarned, useTotalUnlockedGovTokensEarned } from '../../state/stake/hooks'
import { useAggregateGovTokenBalance, useTokenBalance } from '../../state/wallet/hooks'
import { ExternalLink, StyledInternalLink, TYPE, UniTokenAnimated } from '../../theme'
//import { computeUniCirculation } from '../../utils/computeUniCirculation'
import useUSDCPrice from '../../utils/useUSDCPrice'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { Break, CardBGImage, CardNoise, CardSection, DataCard } from '../earn/styled'
import { GOVERNANCE_TOKEN_INTERFACE } from '../../constants/abis/governanceToken'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #008c6b 0%, #000 100%);
  padding: 0.5rem;
`

const StyledClose = styled(X)`
  position: absolute;
  right: 16px;
  top: 16px;

  :hover {
    cursor: pointer;
  }
`

/**
 * Content for balance stats modal
 */
export default function GovTokenBalanceContent({ setShowUniBalanceModal }: { setShowUniBalanceModal: any }) {
  const { account, chainId } = useActiveWeb3React()
  const govToken = chainId ? GOVERNANCE_TOKEN[chainId] : undefined

  const total = useAggregateGovTokenBalance()
  const govTokenBalance: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    govToken,
    'balanceOf',
    GOVERNANCE_TOKEN_INTERFACE
  )
  const govTokenLockedBalance: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    govToken,
    'lockOf',
    GOVERNANCE_TOKEN_INTERFACE
  )
  const govTokenTotalBalance: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    govToken,
    'totalBalanceOf',
    GOVERNANCE_TOKEN_INTERFACE
  )
  const lockedGovTokensToClaim: TokenAmount | undefined = useTotalLockedGovTokensEarned()
  const unlockedGovTokensToClaim: TokenAmount | undefined = useTotalUnlockedGovTokensEarned()
  const totalSupply: TokenAmount | undefined = useGovTokenSupply()
  const totalUnlockedSupply: TokenAmount | undefined = useGovTokenSupply('unlockedSupply')
  const govTokenPrice = useUSDCPrice(govToken)
  /*const blockTimestamp = useCurrentBlockTimestamp()
  const unclaimedUni = useTokenBalance(useMerkleDistributorContract()?.address, viper)
  const circulation: TokenAmount | undefined = useMemo(
    () =>
      blockTimestamp && viper && chainId === ChainId.MAINNET
        ? computeUniCirculation(viper, blockTimestamp, unclaimedUni)
        : totalSupply,
    [blockTimestamp, chainId, totalSupply, unclaimedUni, viper]
  )*/

  return (
    <ContentWrapper gap="lg">
      <ModalUpper>
        <CardBGImage />
        <CardNoise />
        <CardSection gap="md">
          <RowBetween>
            <TYPE.white color="white">Your VIPER Breakdown</TYPE.white>
            <StyledClose stroke="white" onClick={() => setShowUniBalanceModal(false)} />
          </RowBetween>
        </CardSection>
        <Break />
        {account && (
          <>
            <CardSection gap="sm">
              <AutoColumn gap="md" justify="center">
                <UniTokenAnimated width="48px" src={tokenLogo} />{' '}
                <TYPE.white fontSize={48} fontWeight={600} color="white">
                  {total?.toFixed(2, { groupSeparator: ',' })}
                </TYPE.white>
              </AutoColumn>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white color="white">Balance:</TYPE.white>
                  <TYPE.white color="white">{govTokenBalance?.toFixed(2, { groupSeparator: ',' })}</TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white color="white">Unlocked rewards:</TYPE.white>
                  <TYPE.white color="white">
                    {unlockedGovTokensToClaim?.toFixed(2, { groupSeparator: ',' })}{' '}
                    {unlockedGovTokensToClaim && unlockedGovTokensToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowUniBalanceModal(false)} to="/staking">
                        (claim)
                      </StyledInternalLink>
                    )}
                  </TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white color="white">Locked rewards:</TYPE.white>
                  <TYPE.white color="white">
                    {lockedGovTokensToClaim?.toFixed(2, { groupSeparator: ',' })}{' '}
                    {lockedGovTokensToClaim && lockedGovTokensToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowUniBalanceModal(false)} to="/staking">
                        (claim)
                      </StyledInternalLink>
                    )}
                  </TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white color="white">Locked Balance:</TYPE.white>
                  <TYPE.white color="white">{govTokenLockedBalance?.toFixed(2, { groupSeparator: ',' })}</TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white color="white">Total Balance:</TYPE.white>
                  <TYPE.white color="white">{govTokenTotalBalance?.toFixed(2, { groupSeparator: ',' })}</TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
            <Break />
          </>
        )}
        <CardSection gap="sm">
          <AutoColumn gap="md">
            {govToken && govToken.chainId === ChainId.MAINNET ? (
              <RowBetween>
                <TYPE.white color="white">VIPER price:</TYPE.white>
                <TYPE.white color="white">${govTokenPrice?.toFixed(2) ?? '-'}</TYPE.white>
              </RowBetween>
            ) : null}
            <RowBetween>
              <TYPE.white color="white">VIPER in circulation:</TYPE.white>
              <TYPE.white color="white">{totalUnlockedSupply?.toFixed(0, { groupSeparator: ',' })}</TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.white color="white">Total Supply</TYPE.white>
              <TYPE.white color="white">{totalSupply?.toFixed(0, { groupSeparator: ',' })}</TYPE.white>
            </RowBetween>
            {govToken && govToken.chainId === ChainId.MAINNET ? (
              <ExternalLink href={`https://uniswap.info/token/${govToken.address}`}>View UNI Analytics</ExternalLink>
            ) : null}
          </AutoColumn>
        </CardSection>
      </ModalUpper>
    </ContentWrapper>
  )
}
