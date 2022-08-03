from brownie import config, network, DappToken, TokenSale
from scripts.helpful_scripts import get_account
from web3 import Web3
import os
import shutil

INITIAL_SUPPLY = 10000
TOKENS_FOR_SALE = 7500  # 75% of total supply
TOKEN_PRICE = Web3.toWei(0.00001, "ether")


def deploy_token_sale_and_dapp_token(update_frontend=False):
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
    if update_frontend:
        update_front_end()
    return token_sale, dapp_token


def update_front_end():
    # Send the build folder
    src = "./build"
    dest = "./frontend/src/chain-info"
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)
    print("Front end updated!")


def main():
    deploy_token_sale_and_dapp_token(update_frontend=True)
