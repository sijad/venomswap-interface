import { useSingleCallResult, useSingleContractMultipleData } from '../state/multicall/hooks'
import { useMasterBreederContract } from './useContract'
import { useBlockNumber } from '../state/application/hooks'
import { BigNumber } from '@ethersproject/bignumber'

export default function useCalculateWithdrawalFee(
  pid: number,
  account: string | null | undefined
): Record<string, any> {
  let withdrawalFee: number | undefined

  const currentBlock = useBlockNumber()
  const masterBreeder = useMasterBreederContract()

  const userInfo = useSingleCallResult(masterBreeder, 'userInfo', [pid, account ? account : ''])?.result

  const startStages = [0, 1, 2, 3, 4, 5, 6, 7]
  const blockDeltaStartStages = useSingleContractMultipleData(
    masterBreeder,
    'blockDeltaStartStage',
    startStages.map(item => [item])
  )
    .map(stage => {
      return !stage.loading && stage.result ? stage.result[0] : null
    })
    .filter(stage => {
      return stage != null
    })

  const endStages = [0, 1, 2, 3, 4, 5]
  const blockDeltaEndStages = useSingleContractMultipleData(
    masterBreeder,
    'blockDeltaEndStage',
    endStages.map(item => [item])
  )
    .map(stage => {
      return !stage.loading && stage.result ? stage.result[0] : null
    })
    .filter(stage => {
      return stage != null
    })

  const lastWithdrawBlock = userInfo?.[3]
  const firstDepositBlock = userInfo?.[4]
  const blockDelta = userInfo?.[5]
  //const lastDepositBlock = userInfo?.[6]

  let lastActionBlock: BigNumber | undefined = undefined
  let currentBlockDelta: BigNumber = blockDelta

  const currentBlockBigNum = BigNumber.from(currentBlock)

  if (currentBlockBigNum && blockDeltaStartStages.length > 0 && blockDeltaEndStages.length > 0) {
    if (lastWithdrawBlock && lastWithdrawBlock.gt(BigNumber.from(0))) {
      lastActionBlock = lastWithdrawBlock
      currentBlockDelta = currentBlockBigNum.sub(lastWithdrawBlock)
    } else {
      lastActionBlock = firstDepositBlock
      currentBlockDelta = currentBlockBigNum.sub(firstDepositBlock)
    }

    if (currentBlockDelta.eq(blockDeltaStartStages[0]) || currentBlockDelta.eq(currentBlockBigNum)) {
      //25% fee for withdrawals of LP tokens in the same block this is to prevent abuse from flashloans
      withdrawalFee = 25.0
    } else if (currentBlockDelta.gte(blockDeltaStartStages[1]) && currentBlockDelta.lte(blockDeltaEndStages[0])) {
      //8% fee if a user deposits and withdraws in between same block and 59 minutes.
      withdrawalFee = 8.0
    } else if (currentBlockDelta.gte(blockDeltaStartStages[2]) && currentBlockDelta.lte(blockDeltaEndStages[1])) {
      //4% fee if a user deposits and withdraws after 1 hour but before 1 day.
      withdrawalFee = 4.0
    } else if (currentBlockDelta.gte(blockDeltaStartStages[3]) && currentBlockDelta.lte(blockDeltaEndStages[2])) {
      //2% fee if a user deposits and withdraws between after 1 day but before 3 days.
      withdrawalFee = 2.0
    } else if (currentBlockDelta.gte(blockDeltaStartStages[4]) && currentBlockDelta.lte(blockDeltaEndStages[3])) {
      //1% fee if a user deposits and withdraws after 3 days but before 5 days.
      withdrawalFee = 1.0
    } else if (currentBlockDelta.gte(blockDeltaStartStages[5]) && currentBlockDelta.lte(blockDeltaEndStages[4])) {
      //0.5% fee if a user deposits and withdraws if the user withdraws after 5 days but before 2 weeks.
      withdrawalFee = 0.5
    } else if (currentBlockDelta.gte(blockDeltaStartStages[6]) && currentBlockDelta.lte(blockDeltaEndStages[5])) {
      //0.25% fee if a user deposits and withdraws after 2 weeks.
      withdrawalFee = 0.25
    } else if (currentBlockDelta.gt(blockDeltaStartStages[7])) {
      //0.1% fee if a user deposits and withdraws after 4 weeks.
      withdrawalFee = 0.1
    }
  }

  return { lastActionBlock, withdrawalFee }
}
