import DappToken from "./chain-info/contracts/DappToken.json"
import TokenSale from "./chain-info/contracts/TokenSale.json"
import networkMapping from "./chain-info/deployments/map.json"
import {Contract, providers, utils} from "ethers";

export const getDeployedContracts = async () => {
    const dappTokenContract = await getContract(DappToken, "DappToken")
    const tokenSaleContract = await getContract(TokenSale, "TokenSale")
    return {dappTokenContract, tokenSaleContract}
}

const getContract = async (tokenJson, contractName) => {
    const {abi} = tokenJson
    const provider = new providers.Web3Provider(window.ethereum)
    const {chainId} = await provider.getNetwork()
    if (!chainId || !networkMapping[String(chainId)]) {
        return null
    }
    const contractAddress = networkMapping[String(chainId)][contractName][0]
    const contractInterface = new utils.Interface(abi)
    const contract = new Contract(contractAddress, contractInterface, provider.getSigner())
    return await contract.deployed()
}
