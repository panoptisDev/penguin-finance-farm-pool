import BigNumber from 'bignumber.js'
import erc20 from 'config/abi/erc20.json'
import v2MasterchefABI from 'config/abi/v2Masterchef.json'
import v2IglooRewarderABI from 'config/abi/v2Farms/rewarder.json'
import multicall from 'utils/multicall'
import v2FarmsConfig from 'config/constants/v2Farms'
import { getAddress, getV2MasterChefAddress } from 'utils/addressHelpers'
import getV2FarmMasterChefAbi from 'utils/getV2FarmMasterChefAbi'
import getV2FarmMasterChefAddress from 'utils/getV2FarmMasterChefAddress'
import { getSushiLpPrice, getLydiaLpPrice } from 'utils/price'
import { getBalanceNumber } from 'utils/formatBalance'
import { getPangolinRewardPoolApr, getPangolinRewardV2PoolApr, getApr } from 'utils/apyHelpers'
import { getPairSwapDailyReward, getPairInfo } from 'subgraph/utils'
import { getPoolInfo as getJoePoolInfo, getV3PoolInfo as getJoeV3PoolInfo } from 'subgraph/utils/joe'
import { NON_ADDRESS } from 'config'

export const fetchMasterChefGlobalData = async () => {
  const [pefiEmissionPerSecond] = await multicall(v2MasterchefABI, [
    {
      address: getV2MasterChefAddress(),
      name: 'pefiEmissionPerSecond',
    },
  ])

  return { pefiPerSecond: new BigNumber(pefiEmissionPerSecond).div(new BigNumber(10).pow(18)).toNumber() }
}

export const fetchFarms = async () => {
  const data = await Promise.all(
    v2FarmsConfig.map(async (farmConfig) => {
      const lpAddress = getAddress(farmConfig.lpAddresses)
      const farmMasterChefAddress = getV2FarmMasterChefAddress(farmConfig.type)
      const calls = [
        // Balance of token in the LP contract
        {
          address: getAddress(farmConfig.tokenAddresses),
          name: 'balanceOf',
          params: [lpAddress],
        },
        // Balance of LP tokens in the master chef contract
        {
          address: lpAddress,
          name: 'balanceOf',
          params: [farmMasterChefAddress],
        },
        // Total supply of LP tokens
        {
          address: lpAddress,
          name: 'totalSupply',
        },
        // Token decimals
        {
          address: getAddress(farmConfig.tokenAddresses),
          name: 'decimals',
        },
      ]

      const [tokenBalanceLP, lpTokenBalanceMC, lpTotalSupply, tokenDecimals] = await multicall(erc20, calls)
      const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))
      const tokenAmount = new BigNumber(tokenBalanceLP).div(new BigNumber(10).pow(tokenDecimals)).times(lpTokenRatio)

      try {
        const [info, totalAllocPoint, pendingTokens, totalLP, totalShares, pefiPerYear] = await multicall(
          getV2FarmMasterChefAbi(farmConfig.type),
          [
            {
              address: getV2FarmMasterChefAddress(farmConfig.type),
              name: 'poolInfo',
              params: [farmConfig.pid],
            },
            {
              address: getV2FarmMasterChefAddress(farmConfig.type),
              name: 'totalAllocPoint',
            },
            {
              address: getV2FarmMasterChefAddress(farmConfig.type),
              name: 'pendingTokens',
              params: [farmConfig.pid, NON_ADDRESS],
            },
            {
              address: getV2FarmMasterChefAddress(farmConfig.type),
              name: 'totalLP',
              params: [farmConfig.pid],
            },
            {
              address: getV2FarmMasterChefAddress(farmConfig.type),
              name: 'totalShares',
              params: [farmConfig.pid],
            },
            {
              address: getV2FarmMasterChefAddress(farmConfig.type),
              name: 'pefiPerYearToIgloo',
              params: [farmConfig.pid],
            },
          ],
        )

        const allocPoint = new BigNumber(info.allocPoint._hex)
        const withdrawFee = 100 * (info.withdrawFeeBP / 10000)
        const poolWeight = allocPoint.div(new BigNumber(totalAllocPoint))
        let lpPrice = farmConfig.lpPrice || 1
        let totalLiquidityInUsd = getBalanceNumber(new BigNumber(totalLP))
        let joePoolAllocPoint = 0
        let joePoolLpBalance = 1
        let joeSwapPoolUsdBalance = 1

        let swapFeeApr = 0
        let stakingApr = 0
        let swapDailyReward = 0

        swapDailyReward = await getPairSwapDailyReward(lpAddress, farmConfig.type)

        if (farmConfig.type === 'Pangolin') {
          const pairInfo = await getPairInfo(lpAddress, farmConfig.type)
          lpPrice = pairInfo ? Number(pairInfo.reserveUSD) / Number(pairInfo.totalSupply) : 1
          totalLiquidityInUsd = lpPrice * getBalanceNumber(new BigNumber(totalLP))

          const res = farmConfig.isPangolinV2
            ? await getPangolinRewardV2PoolApr(farmConfig.pangolinV2PoolId)
            : await getPangolinRewardPoolApr(getAddress(farmConfig.pangolinRewardPoolAddresses))
          // eslint-disable-next-line prefer-destructuring
          stakingApr = res.stakingApr
          // eslint-disable-next-line prefer-destructuring
          swapFeeApr = res.swapFeeApr
          if (swapFeeApr === 0) {
            if (pairInfo.reserveUSD > 0) {
              swapFeeApr = getApr(swapDailyReward / Number(pairInfo.reserveUSD))
            }
          }
        } else if (farmConfig.type === 'Joe') {
          const pairInfo = await getPairInfo(lpAddress, farmConfig.type)
          lpPrice = pairInfo ? Number(pairInfo.reserveUSD) / Number(pairInfo.totalSupply) : 1
          joeSwapPoolUsdBalance = pairInfo && pairInfo.reserveUSD ? pairInfo.reserveUSD : 1
          totalLiquidityInUsd = lpPrice * getBalanceNumber(new BigNumber(totalLP))

          const joePoolInfo = farmConfig.isJoeRush ? await getJoeV3PoolInfo(lpAddress) : await getJoePoolInfo(lpAddress)
          joePoolAllocPoint = joePoolInfo ? joePoolInfo.allocPoint : 0
          joePoolLpBalance = joePoolInfo ? joePoolInfo.jlpBalance : 0
        } else if (farmConfig.type === 'Sushi') {
          const pairInfo = await getPairInfo(lpAddress, farmConfig.type)
          lpPrice = await getSushiLpPrice(lpAddress)
          totalLiquidityInUsd = lpPrice * getBalanceNumber(new BigNumber(totalLP))

          if (Number(pairInfo.reserveUSD) > 0) {
            swapFeeApr = getApr(swapDailyReward / Number(pairInfo.reserveUSD))
          }
        } else if (farmConfig.type === 'Lydia') {
          lpPrice = await getLydiaLpPrice(lpAddress)
          totalLiquidityInUsd = lpPrice * getBalanceNumber(new BigNumber(totalLP))
        }

        let _pendingTokens = pendingTokens[0]
        _pendingTokens = _pendingTokens.reduce((a, b) => {
          if (a.indexOf(b) < 0) a.push(b)
          return a
        }, [])

        // if (farmConfig.isBenqi) {
        //   _pendingTokens =
        //     pendingTokens[0] && pendingTokens[0].filter((row) => row.toLowerCase() !== getAvaxAddress().toLowerCase())
        // }

        // rewarder contract call
        let minwRewardToken = '0x0000000000000000000000000000000000000000'
        let minwRewardPerSec = 0
        if (
          getAddress(farmConfig.rewarderAddresses) !== '0x0000000000000000000000000000000000000000' &&
          farmConfig.isMINW
        ) {
          const [_minwRewardToken, _minwRewardTokenPerSecond] = await multicall(v2IglooRewarderABI, [
            {
              address: getAddress(farmConfig.rewarderAddresses),
              name: 'rewardToken',
            },
            {
              address: getAddress(farmConfig.rewarderAddresses),
              name: 'tokensPerSecond',
            },
          ])
          minwRewardToken = _minwRewardToken[0]
          minwRewardPerSec = getBalanceNumber(new BigNumber(_minwRewardTokenPerSecond[0]._hex))
        }

        return {
          ...farmConfig,
          tokenAmount: tokenAmount.toJSON(),
          poolWeight: poolWeight.toJSON(),
          multiplier: allocPoint.div(100).toNumber(),
          withdrawFee,
          pendingTokens: _pendingTokens,
          totalLp: new BigNumber(totalLP).toJSON(),
          totalLiquidityInUsd,
          totalShares: new BigNumber(totalShares).toJSON(),
          pefiPerYear: new BigNumber(pefiPerYear).toJSON(),
          maxBips: 10000,
          lpPrice,
          swapFeeApr,
          stakingApr: stakingApr * 0.9,
          swapDailyReward,
          joePoolAllocPoint,
          joePoolLpBalance,
          joeSwapPoolUsdBalance,
          // minw
          minwRewardToken,
          minwRewardPerSec,
        }
      } catch (error) {
        return {
          ...farmConfig,
          tokenAmount: new BigNumber(0).toJSON(),
          poolWeight: new BigNumber(0).toJSON(),
          multiplier: 1,
          withdrawFee: 0,
          pendingTokens: [],
          totalLp: new BigNumber(0).toJSON(),
          totalLiquidityInUsd: 0,
          totalShares: new BigNumber(0).toJSON(),
          pefiPerYear: new BigNumber(0).toJSON(),
          maxBips: 10000,
          lpPrice: 1,
          swapFeeApr: 0,
          stakingApr: 0,
          swapDailyReward: 0,
          joePoolAllocPoint: 0,
          joePoolLpBalance: 1,
        }
      }
    }),
  )
  return data
}
