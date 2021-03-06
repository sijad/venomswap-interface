import { Interface } from '@ethersproject/abi'
import { abi as VIPER_ABI } from '@viperswap/contracts/build/Viper.json'

const VIPER_INTERFACE = new Interface(VIPER_ABI)

export default VIPER_INTERFACE
export { VIPER_ABI, VIPER_INTERFACE }
