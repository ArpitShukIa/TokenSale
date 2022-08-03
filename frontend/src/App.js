import {useEffect, useState} from "react";
import {useEthers} from "@usedapp/core";
import {CircularProgress} from "@mui/material";
import {BigNumber, providers, utils} from "ethers";
import {getDeployedContracts} from "./contractUtils";

const totalTokensAvailable = 7500

function App() {
    const [tokenSaleContract, setTokenSaleContract] = useState(null)
    const [tokenPrice, setTokenPrice] = useState(0)
    const [balance, setBalance] = useState("0")
    const [tokensSold, setTokensSold] = useState("0")
    const [tokensToBuy, setTokensToBuy] = useState("1")
    const [progress, setProgress] = useState(0)
    const [loading, setLoading] = useState(false)

    const {account, activateBrowserWallet, deactivate, chainId} = useEthers()

    const isConnected = account !== undefined

    useEffect(() => {
        const provider = new providers.Web3Provider(window.ethereum, "any")
        provider.on("network", (newNetwork, oldNetwork) => {
            // When a Provider makes its initial connection, it emits a "network"
            // event with a null oldNetwork along with the newNetwork. So, if the
            // oldNetwork exists, it represents a changing network
            if (oldNetwork) {
                window.location.reload()
            }
        })
    }, [])

    useEffect(() => {
        const run = async () => {
            if (!account)
                return
            setLoading(true)
            const {dappTokenContract, tokenSaleContract} = await getDeployedContracts()
            if (!dappTokenContract) {
                console.log('Not connected to Rinkeby Test Network')
                setLoading(false)
                return
            }
            setTokenSaleContract(tokenSaleContract)
            const tokenPrice = await tokenSaleContract.tokenPrice()
            const tokenBalance = await dappTokenContract.balanceOf(account)
            const tokensSold = await tokenSaleContract.tokensSold()
            setTokenPrice(tokenPrice.toNumber())
            setBalance(tokenBalance.toNumber())
            setTokensSold(tokensSold.toNumber())
            setProgress(100 * tokensSold.toNumber() / totalTokensAvailable)
            setLoading(false)

            const provider = new providers.Web3Provider(window.ethereum, "any")
            const startBlockNumber = await provider.getBlockNumber();
            tokenSaleContract.on('Sell', (...args) => {
                const event = args[args.length - 1];
                if (event.blockNumber > startBlockNumber)
                    window.location.reload()
            })
        }
        run()
    }, [account, chainId])

    const buyTokens = (e) => {
        e.preventDefault()
        if (!tokenSaleContract)
            return
        const run = async () => {
            const valueToSend = BigNumber.from(tokensToBuy).mul(BigNumber.from(tokenPrice))
            setLoading(true)
            try {
                const tx = await tokenSaleContract.buyTokens(
                    BigNumber.from(tokensToBuy),
                    {from: account, value: valueToSend}
                )
                await tx.wait(1)
            } catch (e) {
            }
            setLoading(false)
        }
        run()
    }

    return (<div className="container" style={{width: "650px"}}>
        {
            loading
                ? <div style={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <CircularProgress size={80}/>
                </div>
                :
                <div className="text-center">
                    {
                        isConnected ?
                            <button className="btn btn-secondary"
                                    style={{position: "absolute", right: 30}}
                                    onClick={deactivate}
                            >
                                Disconnect
                            </button>
                            : ""
                    }
                    <h1 className="text-center mt-4">DAPP TOKEN ICO SALE</h1>
                    <hr/>
                    <br/>
                    {
                        isConnected
                            ? <div>
                                <p>Introducing <b>DApp Token</b> (DAPP) !!!</p>
                                <p>Token price is {utils.formatEther(tokenPrice)} Ether. You currently
                                    have {balance} DAPP.</p>
                                <br/>
                                <form onSubmit={buyTokens}>
                                    <div className="form-group">
                                        <div className="input-group">
                                            <input className="form-control input-lg" type="number"
                                                   value={tokensToBuy}
                                                   onChange={e => setTokensToBuy(e.target.value)}
                                                   min={1} pattern="[0-9]">
                                            </input>
                                            <button className="btn btn-primary btn-lg">Buy Tokens</button>
                                        </div>
                                    </div>
                                </form>
                                <br/>
                                <div className="progress">
                                    <div className="progress-bar progress-bar-striped active"
                                         style={{width: progress + "%"}}
                                         aria-valuemin="0" aria-valuemax="100">
                                    </div>
                                </div>
                                <p className="mt-1">{tokensSold} / {totalTokensAvailable} tokens sold</p>
                                <hr/>
                                <p className="text-center">Your account: {account}</p>
                            </div>
                            : <div style={{textAlign: "center"}}>
                                <p style={{fontSize: 20}}>Connect to your Metamask wallet</p>
                                <button className="btn btn-primary" onClick={activateBrowserWallet}>Connect</button>
                            </div>
                    }
                </div>
        }
    </div>);
}

export default App;
