import BigNumber from 'bignumber.js'

export default class NanoConverter {

	/**
	 * Converts the input value to the wanted unit
	 *
	 * @param input {string | BigNumber} value
	 * @param inputUnit {string} the unit to convert from
	 * @param outputUnit {string} the unit to convert to
	 */
	static convert(input: string | BigNumber, inputUnit: string, outputUnit: string): string {
		let value = new BigNumber(input.toString())

		switch (inputUnit) {
			case 'RAW':
				value = value
				break
			case 'NANO':
			case 'MRAI':
				value = value.shiftedBy(6)
				break
			case 'KRAI':
				value = value.shiftedBy(3)
				break
			case 'RAI':
				value = value.shiftedBy(0)
				break
			default:
				throw new Error(`Unkown input unit ${inputUnit}, expected one of the following: RAW, NANO, MRAI, KRAI, RAI`)
		}

		switch (outputUnit) {
			case 'RAW':
				return value.toFixed(0)
			case 'NANO':
			case 'MRAI':
				return value.shiftedBy(-6).toFixed(6, 1)
			case 'KRAI':
				return value.shiftedBy(-3).toFixed(3, 1)
			case 'RAI':
				return value.shiftedBy(-0).toFixed(0, 1)
			default:
				throw new Error(`Unknown output unit ${outputUnit}, expected one of the following: RAW, NANO, MRAI, KRAI, RAI`)
		}
	}

}
