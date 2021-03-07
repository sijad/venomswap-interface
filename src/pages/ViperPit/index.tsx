import React, { useCallback, useState } from 'react'
import { TokenAmount } from '@venomswap/sdk'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'

//import { JSBI } from '@venomswap/sdk'
//import { JSBI, TokenAmount, ETHER } from '@venomswap/sdk'
import { RouteComponentProps } from 'react-router-dom'
import { useWalletModalToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'

import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earn/styled'
import { ButtonPrimary } from '../../components/Button'
import StakingModal from '../../components/ViperPit/StakingModal'
import ModifiedUnstakingModal from '../../components/ViperPit/ModifiedUnstakingModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
//import { useColor } from '../../hooks/useColor'
import { CountUp } from 'use-count-up'

import usePrevious from '../../hooks/usePrevious'

import { GOVERNANCE_TOKEN, PIT } from '../../constants'
import { GOVERNANCE_TOKEN_INTERFACE } from '../../constants/abis/governanceToken'
import { PIT_INTERFACE } from '../../constants/abis/pit'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

/*const PositionInfo = styled(AutoColumn)<{ dim: any }>`
  position: relative;
  max-width: 640px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`*/

const BottomSection = styled(AutoColumn)`
  border-radius: 12px;
  width: 100%;
  position: relative;
`

/*const StyledDataCard = styled(DataCard)<{ bgColor?: any; showBackground?: any }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #1e1a31 0%, #3d51a5 100%);
  z-index: 2;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%,  ${showBackground ? theme.black : theme.bg5} 100%) `};
`*/

const StyledBottomCard = styled(DataCard)<{ dim: any }>`
  background: ${({ theme }) => theme.bg3};
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
  margin-top: -40px;
  padding: 0 1.25rem 1rem 1.25rem;
  padding-top: 32px;
  z-index: 1;
`

/*const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`*/

/*const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`*/

const CustomCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #008c6b 0%, #00c09c 100%);
  overflow: hidden;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

export default function ViperPit({
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const { account, chainId } = useActiveWeb3React()

  const govToken = chainId ? GOVERNANCE_TOKEN[chainId] : undefined
  const pit = chainId ? PIT[chainId] : undefined

  const govTokenBalance: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    govToken,
    'balanceOf',
    GOVERNANCE_TOKEN_INTERFACE
  )

  const pitBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, pit, 'balanceOf', PIT_INTERFACE)

  const userLiquidityStaked = pitBalance
  const userLiquidityUnstaked = govTokenBalance

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)

  const countUpAmount = pitBalance?.toFixed(6) ?? '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

  const toggleWalletModal = useWalletModalToggle()

  const handleDepositClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  return (
    <PageWrapper gap="lg" justify="center">

      {govToken && (
        <>
          <StakingModal
            isOpen={showStakingModal}
            onDismiss={() => setShowStakingModal(false)}
            stakingToken={govToken}
            userLiquidityUnstaked={userLiquidityUnstaked}
          />
          <ModifiedUnstakingModal
            isOpen={showUnstakingModal}
            onDismiss={() => setShowUnstakingModal(false)}
            userLiquidityStaked={userLiquidityStaked}
            stakingToken={govToken}
          />
        </>
      )}

      <TopSection gap="lg" justify="center">
        <BottomSection gap="lg" justify="center">
          <CustomCard>
            <CardSection>
              <CardBGImage desaturate />
              <CardNoise />
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>ViperPit - DEX fee sharing</TYPE.white>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={14}>
                    Stake your VIPER tokens and earn 1/3rd of the generated trading fees.
                  </TYPE.white>
                </RowBetween>
                <br />
              </AutoColumn>
            </CardSection>
          </CustomCard>
          <StyledBottomCard dim={false}>
            <CardBGImage desaturate />
            <CardNoise />
            <AutoColumn gap="sm">
              <RowBetween>
                <div>
                  <TYPE.black>Your xVIPER Balance</TYPE.black>
                </div>
              </RowBetween>
              <RowBetween style={{ alignItems: 'baseline' }}>
                <TYPE.largeHeader fontSize={36} fontWeight={600}>
                  <CountUp
                    key={countUpAmount}
                    isCounting
                    decimalPlaces={4}
                    start={parseFloat(countUpAmountPrevious)}
                    end={parseFloat(countUpAmount)}
                    thousandsSeparator={','}
                    duration={1}
                  />
                </TYPE.largeHeader>
              </RowBetween>
            </AutoColumn>
          </StyledBottomCard>
        </BottomSection>

        <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ⭐️
          </span>
          ViperPit rewards aren&apos;t locked
          <br />
          &mdash; when you withdraw you&apos;ll receive 100%
          <br />
          of your share of earned VIPER trading fees straight away!
        </TYPE.main>

        {account && (
          <DataRow style={{ marginBottom: '1rem' }}>
            <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleDepositClick}>
              Stake
            </ButtonPrimary>

            <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={() => setShowUnstakingModal(true)}>
              Withdraw
            </ButtonPrimary>
          </DataRow>
        )}
        {account && (
          <TYPE.main>
            {govTokenBalance?.toFixed(2, { groupSeparator: ',' })} VIPER tokens available to deposit to the Viper Pit
          </TYPE.main>
        )}
      </TopSection>
    </PageWrapper>
  )
}
