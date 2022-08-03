from scripts.deploy import deploy_token_sale_and_dapp_token, TOKEN_PRICE, TOKENS_FOR_SALE, INITIAL_SUPPLY
from scripts.helpful_scripts import get_account
from brownie import exceptions
import pytest


def test_token_buy():
    buyer = get_account(index=1)
    token_sale, dapp_token = deploy_token_sale_and_dapp_token()

    with pytest.raises(exceptions.VirtualMachineError):
        # Sending insufficient value
        token_sale.buyTokens(10, {"from": buyer, "value": 1})

    with pytest.raises(exceptions.VirtualMachineError):
        # Buying more tokens than available
        token_sale.buyTokens(800_000, {"from": buyer, "value": 800_000 * TOKEN_PRICE})

    tokens_to_buy = 10
    tx = token_sale.buyTokens(tokens_to_buy, {"from": buyer, "value": tokens_to_buy * TOKEN_PRICE})
    assert token_sale.tokensSold() == tokens_to_buy
    assert dapp_token.balanceOf(buyer) == tokens_to_buy
    assert dapp_token.balanceOf(token_sale) == TOKENS_FOR_SALE - tokens_to_buy
    assert tx.events["Sell"]["_buyer"] == buyer
    assert tx.events["Sell"]["_amount"] == tokens_to_buy


def test_sale_end():
    owner = get_account()
    non_owner = get_account(index=1)
    token_sale, dapp_token = deploy_token_sale_and_dapp_token()

    tokens_sold = 10
    token_sale.buyTokens(tokens_sold, {"from": non_owner, "value": tokens_sold * TOKEN_PRICE})

    with pytest.raises(exceptions.VirtualMachineError):
        # Ending sale from non-owner account
        token_sale.endSale({"from": non_owner})

    token_sale.endSale({"from": owner})
    assert dapp_token.balanceOf(owner) == INITIAL_SUPPLY - tokens_sold
    assert dapp_token.balanceOf(token_sale) == 0
    assert token_sale.balance() == 0
