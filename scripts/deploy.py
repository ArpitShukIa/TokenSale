from brownie import config, network, DappToken, TokenSale
from scripts.helpful_scripts import get_account
from web3 import Web3

INITIAL_SUPPLY = 1_000_000
TOKENS_FOR_SALE = 750_000  # 75% of total supply
TOKEN_PRICE = Web3.toWei(0.001, "ether")


def deploy_token_sale_and_dapp_token():
    account = get_account()
    dapp_token = DappToken.deploy(INITIAL_SUPPLY, {"from": account})
    token_sale = TokenSale.deploy(
        dapp_token.address,
        TOKEN_PRICE,
        {"from": account},
        publish_source=config["networks"][network.show_active()].get("verify", False)
    )
    tx = dapp_token.transfer(
        token_sale.address, TOKENS_FOR_SALE, {"from": account}
    )
    tx.wait(1)
    return token_sale, dapp_token


def main():
    deploy_token_sale_and_dapp_token()
