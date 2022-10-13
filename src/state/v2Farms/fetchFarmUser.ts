import BigNumber from 'bignumber.js'
import erc20ABI from 'config/abi/erc20.json'
import multicall from 'utils/multicall'
import v2FarmsConfig from 'config/constants/v2Farms'
import { getAddress } from 'utils/addressHelpers'
import getV2FarmMasterChefAbi from 'utils/getV2FarmMasterChefAbi'
import { getContract } from 'utils/web3';
import v2FarmStrategyAbi from 'config/abi/lpStrategy.json'
import getV2FarmMasterChefAddress from 'utils/getV2FarmMasterChefAddress'

export const fetchFarmUserAllowances = async (account: string) => {
  const calls = v2FarmsConfig.map((farm) => {
    const lpContractAddress = getAddress(farm.lpAddresses)
    const masterChefAddress = getV2FarmMasterChefAddress(farm.type)
    return { address: lpContractAddress, name: 'allowance', params: [account, masterChefAddress] }
  })

  const rawLpAllowances = await multicall(erc20ABI, calls)
  const parsedLpAllowances = rawLpAllowances.map((lpBalance) => {
    return new BigNumber(lpBalance).toJSON()
  })

  return parsedLpAllowances
}

export const fetchFarmUserTokenBalances = async (account: string) => {
  const calls = v2FarmsConfig.map((farm) => {
    const lpContractAddress = getAddress(farm.lpAddresses)

    return {
      address: lpContractAddress,
      name: 'balanceOf',
      params: [account],
    }
  })

  const rawTokenBalances = await multicall(erc20ABI, calls)
  const parsedTokenBalances = rawTokenBalances.map((tokenBalance) => {
    return new BigNumber(tokenBalance).toJSON()
  })
  return parsedTokenBalances
}

export const fetchJoePefiAvaxPreviousRewardsClaimed = async (account: string) => {
  const joePefiAvaxFarm = v2FarmsConfig.find(farm => farm.pid === 5);
  const strategyContract = getContract(v2FarmStrategyAbi, getAddress(joePefiAvaxFarm.strategyAddresses));

  const previousRewardsClaimed = await strategyContract.methods.previousRewardsClaimed(account).call();
  return previousRewardsClaimed
}

export const fetchFarmUserStakedBalances = async (account: string) => {
  const results = []
  for (let i = 0; i < v2FarmsConfig.length; i++) {
    const call = [
      {
        address: getV2FarmMasterChefAddress(v2FarmsConfig[i].type),
        name: 'userInfo',
        params: [v2FarmsConfig[i].pid, account],
      },
    ]

    const v2MasterChefABI = getV2FarmMasterChefAbi(v2FarmsConfig[i].type)
    const farmRes = multicall(v2MasterChefABI, call)
    results.push(farmRes)
  }

  const rawStakedBalances = await Promise.all(results)
  const parsedStakedBalances = rawStakedBalances.map((stakedBalance) => {
    return new BigNumber(stakedBalance[0][0]._hex).toJSON()
  })
  return parsedStakedBalances
}

export const fetchFarmUserEarnings = async (account: string) => {
  const results = []
  for (let i = 0; i < v2FarmsConfig.length; i++) {
    const call = [
      {
        address: getV2FarmMasterChefAddress(v2FarmsConfig[i].type),
        name: 'pendingPEFI',
        params: [v2FarmsConfig[i].pid, account],
      },
    ]

    const v2MasterChefABI = getV2FarmMasterChefAbi(v2FarmsConfig[i].type)
    const farmRes = multicall(v2MasterChefABI, call)
    results.push(farmRes)
  }

  const rawEarnings = await Promise.all(results)

  const parsedEarnings = rawEarnings.map((earnings) => {
    return new BigNumber(earnings[0]).toJSON()
  })

  return parsedEarnings
}

export const fetchFarmUserData = async (account: string) => {
  try {
    const results = []

    for (let i = 0; i < v2FarmsConfig.length; i++) {
      const call = [
        {
          address: getV2FarmMasterChefAddress(v2FarmsConfig[i].type),
          name: 'userInfo',
          params: [v2FarmsConfig[i].pid, account],
        },
        {
          address: getV2FarmMasterChefAddress(v2FarmsConfig[i].type),
          name: 'pendingPEFI',
          params: [v2FarmsConfig[i].pid, account],
        },
        {
          address: getV2FarmMasterChefAddress(v2FarmsConfig[i].type),
          name: 'userShares',
          params: [v2FarmsConfig[i].pid, account],
        },
        {
          address: getV2FarmMasterChefAddress(v2FarmsConfig[i].type),
          name: 'pendingTokens',
          params: [v2FarmsConfig[i].pid, account],
        },
        {
          address: getV2FarmMasterChefAddress(v2FarmsConfig[i].type),
          name: 'ipefiDistributionBipsByUser',
          params: [account],
        },
      ]

      const v2MasterChefABI = getV2FarmMasterChefAbi(v2FarmsConfig[i].type)
      const farmRes = multicall(v2MasterChefABI, call)
      results.push(farmRes)
    }

    const _results = await Promise.all(results)

    const stakedBalances = _results.map((result) => {
      return new BigNumber(result[0][0]._hex).toJSON()
    })
    const parsedEarnings = _results.map((result) => {
      return new BigNumber(result[1]).toJSON()
    })
    const userShares = _results.map((result) => {
      return new BigNumber(result[2]).toJSON()
    })
    const pendingTokens = _results.map((result) => {
      const _pendingTokens = result[3]
      return _pendingTokens[0].map((row, index) => {
        return { address: row, amount: new BigNumber(_pendingTokens[1][index]._hex).toJSON() }
      })
    })
    const ipefiDistributionBipsByUser = _results.map((result) => {
      return new BigNumber(result[4]).toJSON()
    })

    return {
      userStakedBalances: stakedBalances,
      userFarmEarnings: parsedEarnings,
      userFarmShares: userShares,
      userPendingTokens: pendingTokens,
      userIpefiDistributionBips: ipefiDistributionBipsByUser,
    }
  } catch (error) {
    return {
      userStakedBalances: new BigNumber(0),
      userFarmEarnings: new BigNumber(0),
      userFarmShares: new BigNumber(0),
      userPendingTokens: [],
      userIpefiDistributionBips: new BigNumber(0),
    }
  }
}
