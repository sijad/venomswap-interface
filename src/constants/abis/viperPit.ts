import { Interface } from '@ethersproject/abi'
import { abi as VIPER_PIT } from '@viperswap/contracts/build/ViperPit.json'

const VIPER_PIT_INTERFACE = new Interface(VIPER_PIT)

export default VIPER_PIT_INTERFACE
export { VIPER_PIT, VIPER_PIT_INTERFACE }
