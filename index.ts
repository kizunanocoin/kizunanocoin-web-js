import BigNumber from 'bignumber.js'

import AddressGenerator from './lib/address-generator'
import AddressImporter, { Account, Wallet } from './lib/address-importer'
import BlockSigner, { ReceiveBlock, RepresentativeBlock, SendBlock, SignedBlock } from './lib/block-signer'
import NanoAddress from './lib/nano-address'
import NanoConverter from './lib/nano-converter'
import Signer from './lib/signer'
import Convert from './lib/util/convert'

const nanoAddress = new NanoAddress()
const generator = new AddressGenerator()
const importer = new AddressImporter()
const signer = new Signer()

const wallet = {

	/**
	 * Generate a new Nano cryptocurrency wallet
	 *
	 * This function generates a wallet from random entropy. Wallet includes
	 * a BIP39 mnemonic phrase in line with the Nano Ledger implementation and
	 * a seed, the account is derived using BIP32 deterministic hierarchial algorithm
	 * with input parameters 44'/165' and index 0.
	 *
	 * The Nano address is derived from the public key using standard Nano encoding.
	 * The address is prefixed with 'nano_'.
	 *
	 * Generation uses CryptoJS to generate random entropy by default. You can give your own entropy
	 * as a parameter and it will be used instead.
	 *
	 * An optional seed password can be used to encrypt the mnemonic phrase so the seed
	 * cannot be derived correctly without the password. Recovering the password is not possible.
	 *
	 * @param {string} [entropy] - (Optional) 64 byte hexadecimal string entropy to be used instead of the default
	 * @param {string} [seedPassword] - (Optional) seed password
	 * @returns the generated mnemonic, seed and account
	 */
	generate: (entropy?: string, seedPassword?: string): Wallet => {
		return generator.generateWallet(entropy, seedPassword)
	},

	/**
	 * Import a Nano cryptocurrency wallet from a mnemonic phrase
	 *
	 * This function imports a wallet from a mnemonic phrase. Wallet includes the mnemonic phrase,
	 * a seed derived with BIP39 standard and an account derived using BIP32 deterministic hierarchial
	 * algorithm with input parameters 44'/165' and index 0.
	 *
	 * The Nano address is derived from the public key using standard Nano encoding.
	 * The address is prefixed with 'nano_'.
	 *
	 * @param {string} mnemonic - The mnemonic phrase. Words are separated with a space
	 * @param {string} [seedPassword] - (Optional) seed password
	 * @throws Throws an error if the mnemonic phrase doesn't pass validations
	 * @returns the wallet derived from the mnemonic (mnemonic, seed, account)
	 */
	fromMnemonic: (mnemonic: string, seedPassword?: string): Wallet => {
		return importer.fromMnemonic(mnemonic, seedPassword)
	},

	/**
	 * Import a Nano cryptocurrency wallet from a seed
	 *
	 * This function imports a wallet from a seed. Wallet includes the seed and an account derived using
	 * BIP39 standard and an account derived using BIP32 deterministic hierarchial algorithm with input
	 * parameters 44'/165' and index 0.
	 *
	 * The Nano address is derived from the public key using standard Nano encoding.
	 * The address is prefixed with 'nano_'.
	 *
	 * @param {string} seed - The seed
	 * @returns {Wallet} the wallet derived from the seed (seed, account)
	 */
	fromSeed: (seed: string): Wallet => {
		return importer.fromSeed(seed)
	},

	/**
	 * Import Nano cryptocurrency accounts from a legacy hex seed
	 *
	 * This function imports a wallet from a seed. The private key is derived from the seed using
	 * simply a blake2b hash function. The public key is derived from the private key using the ed25519 curve
	 * algorithm.
	 *
	 * The Nano address is derived from the public key using standard Nano encoding.
	 * The address is prefixed with 'nano_'.
	 *
	 * @param {string} seed - The seed
	 * @returns the wallet derived from the seed (seed, account)
	 *
	 */
	fromLegacySeed: (seed: string): Wallet => {
		return importer.fromLegacySeed(seed);
	},

	/**
	 * Derive accounts for the seed
	 *
	 * This function derives Nano accounts with the BIP32 deterministic hierarchial algorithm
	 * from the given seed with input parameters 44'/165' and indexes based on the from and to
	 * parameters.
	 *
	 * @param {string} seed - The seed
	 * @param {number} from - The start index
	 * @param {number} to - The end index
	 */
	accounts: (seed: string, from: number, to: number): Account[] => {
		return importer.fromSeed(seed, from, to).accounts
	},

	/**
	 * Derive accounts for the legacy hex seed
	 *
	 * This function derives Nano accounts with the given seed with indexes
	 * based on the from and to parameters.
	 *
	 * @param {string} seed - The seed
	 * @param {number} from - The start index
	 * @param {number} to - The end index
	 */
	legacyAccounts: (seed: string, from: number, to: number): Account[] => {
		return importer.fromLegacySeed(seed, from, to).accounts
	},

}

const blockSigner = new BlockSigner()
const block = {

	/**
	 * Sign a send block with the input parameters
	 *
	 * For a send block, put your own address to the 'fromAddress' property and
	 * the recipient address to the 'toAddress' property.
	 * All the NANO amounts should be input in RAW format. The addresses should be
	 * valid Nano addresses. Fetch the current balance, frontier (previous block) and
	 * representative address from the blockchain and generate work for the signature.
	 *
	 * The return value of this function is ready to be published to the blockchain.
	 *
	 * NOTICE: Always fetch up-to-date account info from the blockchain
	 *         before signing the block
	 *
	 * @param {SendBlock} data The data for the block
	 * @param {string} privateKey Private key to sign the block
	 */
	send: (data: SendBlock, privateKey: string): SignedBlock => {
		return blockSigner.send(data, privateKey)
	},


	/**
	 * Sign a receive block with the input parameters
	 *
	 * For a receive block, put your own address to the 'toAddress' property.
	 * All the NANO amounts should be input in RAW format. The addresses should be
	 * valid Nano addresses. Fetch the current balance, frontier (previous block) and
	 * representative address from the blockchain and generate work for the signature.
	 * Input the receive amount and transaction hash from the pending block.
	 *
	 * The return value of this function is ready to be published to the blockchain.
	 *
	 * NOTICE: Always fetch up-to-date account info from the blockchain
	 *         before signing the block
	 *
	 * @param {ReceiveBlock} data The data for the block
	 * @param {string} privateKey Private key to sign the block
	 */
	receive: (data: ReceiveBlock, privateKey: string): SignedBlock => {
		return blockSigner.receive(data, privateKey)
	},


	/**
	 * Sign a representative change block with the input parameters
	 *
	 * For a change block, put your own address to the 'address' property.
	 * All the NANO amounts should be input in RAW format. The addresses should be
	 * valid Nano addresses. Fetch the current balance, previous block from the
	 * blockchain and generate work for the signature. Set the new representative address
	 * as the representative.
	 *
	 * NOTICE: Always fetch up-to-date account info from the blockchain
	 *         before signing the block
	 *
	 * @param {RepresentativeBlock} data The data for the block
	 * @param {string} privateKey Private key to sign the block
	 *
	 */
	representative: (data: RepresentativeBlock, privateKey: string): SignedBlock => {
		const block: SendBlock = {
			...data,
			fromAddress: data.address,
			amountRaw: '0',
			toAddress: 'nano_1111111111111111111111111111111111111111111111111111hifc8npp', // Burn address
		}

		return blockSigner.send(block, privateKey)
	},

}

const tools = {

	/**
	 * Convert Nano values
	 *
	 * Possible units are RAW, NANO, MRAI, KRAI, RAI
	 *
	 * @param {string | BigNumber} input The input value
	 * @param {string} inputUnit The unit of the input value
	 * @param {string} outputUnit The unit you wish to convert to
	 */
	convert: (input: string | BigNumber, inputUnit: string, outputUnit: string): string => {
		return NanoConverter.convert(input, inputUnit, outputUnit)
	},

	/**
	 * Sign any strings with the user's private key
	 *
	 * @param {string} privateKey The private key to sign with
	 * @param {...string} input Data to sign
	 */
	sign: (privateKey: string, ...input: string[]): string => {
		const data = input.map(Convert.stringToHex)
		return signer.sign(privateKey, ...data);
	},

	/**
	 * Validate a Nano address
	 *
	 * @param {string} input The address to validate
	 */
	validateAddress: (input: string): boolean => {
		return nanoAddress.validateNanoAddress(input);
	},

	/**
	 * Validate mnemonic words
	 *
	 * @param {string} input The address to validate
	 */
	validateMnemonic: (input: string): boolean => {
		return importer.validateMnemonic(input);
	},

}

export {
	wallet,
	block,
	tools,
}
