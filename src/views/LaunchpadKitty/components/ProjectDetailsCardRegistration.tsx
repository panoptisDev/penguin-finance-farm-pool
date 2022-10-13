import React, { useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { Text, Flex, Button, useMatchBreakpoints } from 'penguinfinance-uikit2'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import Page from 'components/layout/Page'
import UnlockButton from 'components/UnlockButton'
import { useKittyLaunchpad, useClubPenguinFarms } from 'state/hooks'
import { getBalanceNumber } from 'utils/formatBalance'
import { getIPefiAddress } from 'utils/addressHelpers'
import useTokenBalance from 'hooks/useTokenBalance'

const TOKEN_INFO = [
  { label: 'Token NAME', value: 'Kitty' },
  { label: 'TOKEN SYMBOL', value: 'KITTY' },
  { label: 'TOTAL SUPPLY', value: '100,000,000' },
  { label: 'INITIAL SUPPLY', value: '12,500,000' },
  { label: 'INITIAL MARKET CAP', value: '$562,500' },
  { label: 'TOKEN TYPE', value: 'Betting' },
  { label: 'TOKEN ADDRESS ', value: '0xbca7f1998Dc9FFB70b086543a808960a460aBcA7', type: 'address' },
]

const LAUNCHPAD_INFO = [
  { label: 'PROJECT NAME', value: 'BinaryCat' },
  { label: 'TOKEN SYMBOL', value: 'KITTY' },
  { label: 'TOKENS OFFERED', value: '12,500,000' },
  { label: 'VESTING PERIOD', value: 'No Launchpad Vesting Period' },
  { label: 'PROJECT WEBSITE', value: 'https://www.binarycat.app', type: 'link' },
  { label: 'NUMBER OF REGISTRATIONS', value: '0' },
  { label: 'SALE CONTRACT ADDRESS ', value: 'N/A' },
]

const TABS = [
  {
    label: 'Your Allocations & Tier',
    value: 'allocations',
    smLabel: 'Allocations & Tier',
  },
  {
    label: 'Launchpad',
    value: 'launchpad',
    smLabel: 'Launchpad',
  },
  {
    label: 'About the Project',
    value: 'about',
    smLabel: 'About',
  },
  {
    label: 'Token Info',
    value: 'token-info',
    smLabel: 'Token',
  },
]

const TIERS = [
  {
    label: 'GrumpyCat',
    imageUrl: 'GrumpyCat.svg',
    requiredIPEFI: 250,
  },
  {
    label: 'AstroCat',
    imageUrl: 'AstroCat.svg',
    requiredIPEFI: 6000,
  },
  {
    label: 'NyanCat',
    imageUrl: 'NyanCat.svg',
    requiredIPEFI: 60000,
  },
]

const getEllipsisAddress = (address) => {
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
}

const ProjectDetailsCardRegistration = () => {
  const [activeTab, setActiveTab] = useState('allocations')
  const { account } = useWeb3React()
  const { isDark } = useTheme()
  const { isXs, isSm, isXl } = useMatchBreakpoints()
  const { allocation, yourPenguinTier, registeredPenguins } = useKittyLaunchpad(account)
  // iPefi balance in wallet
  const iPefiBalanceInWallet = useTokenBalance(getIPefiAddress())
  // iPefi staked balance in clubs
  const clubFarms = useClubPenguinFarms(account)
  const getIPefiStakedBalanceInClubs = () => {
    let _iPefiStakedBalanceInClubs = new BigNumber(0)
    clubFarms.map((clubFarm) => {
      const { userData } = clubFarm
      if (userData) {
        _iPefiStakedBalanceInClubs = _iPefiStakedBalanceInClubs.plus(new BigNumber(userData.stakedBalance))
      }
      return clubFarm
    })
    return _iPefiStakedBalanceInClubs
  }

  const staked = iPefiBalanceInWallet.plus(getIPefiStakedBalanceInClubs())
  const isMobile = isXs || isSm
  const launchpadStaked = getBalanceNumber(new BigNumber(staked))
  const allocationValue = getBalanceNumber(new BigNumber(allocation))
  // const hasTier = launchpadStaked >= 250
  const hasTier = true
  const yourTier = hasTier && yourPenguinTier >= 1 ? TIERS[yourPenguinTier - 1].label : 'none_tier'
  const handleChangeActiveTab = (tab) => () => {
    setActiveTab(tab)
  }

  const handleViewToken = (tokenAddress) => () => {
    window.open(`https://snowtrace.io/token/${tokenAddress}`, '_blank')
  }

  const handleViewWebsite = (websiteLink) => () => {
    window.open(websiteLink, '_blank')
  }

  const handleSignUp = () => {
    window.open('https://t.me/pefi_announcements', '_blank')
  }

  const renderLaunchpadInfo = () => {
    return (
      <IdoDetailsContainer>
        <HeaderTitle fontSize="34px" color="#313131" fontWeight={800} mb="35px">
          Launchpad Info
        </HeaderTitle>
        <TokenSalesEconomics>
          {LAUNCHPAD_INFO.map((tokenEconomic) => {
            return (
              <TokenEconomic key={tokenEconomic.label} justifyContent="space-between">
                <Text color={isDark ? '#9A97C4' : '#5E4BAF'} fontSize="14px" lineHeight="32px" fontWeight={600}>
                  {tokenEconomic.label}
                </Text>
                <TokenInfoValue
                  onClick={tokenEconomic.type === 'link' && handleViewWebsite(tokenEconomic.value)}
                  clickable={tokenEconomic.type === 'link'}
                  color="#292929"
                  fontSize="16px"
                  lineHeight="32px"
                  fontWeight={600}
                >
                  {tokenEconomic.label === 'NUMBER OF REGISTRATIONS' ? registeredPenguins : tokenEconomic.value}
                </TokenInfoValue>
              </TokenEconomic>
            )
          })}
        </TokenSalesEconomics>
      </IdoDetailsContainer>
    )
  }

  const renderTokenInfo = () => {
    return (
      <IdoDetailsContainer>
        <HeaderTitle fontSize="34px" color="#313131" fontWeight={800} mb="35px">
          Token Info
        </HeaderTitle>
        <TokenSalesEconomics>
          {TOKEN_INFO.map((tokenEconomic) => {
            return (
              <TokenEconomic key={tokenEconomic.label} justifyContent="space-between">
                <Text color={isDark ? '#9A97C4' : '#5E4BAF'} fontSize="14px" lineHeight="32px" fontWeight={600}>
                  {tokenEconomic.label}
                </Text>
                <TokenInfoValue
                  onClick={tokenEconomic.type === 'address' && handleViewToken(tokenEconomic.value)}
                  clickable={tokenEconomic.type === 'address'}
                  color="#292929"
                  fontSize="16px"
                  lineHeight="32px"
                  fontWeight={600}
                >
                  {tokenEconomic.type === 'address' ? getEllipsisAddress(tokenEconomic.value) : tokenEconomic.value}
                </TokenInfoValue>
              </TokenEconomic>
            )
          })}
        </TokenSalesEconomics>
      </IdoDetailsContainer>
    )
  }

  const renderTokenAllocation = () => {
    return (
      <AllocationsContainer>
        <HeaderTitle fontSize="34px" color="#313131" fontWeight={800} mb="35px">
          Allocations & Tier
        </HeaderTitle>
        <TierInfo justifyContent="space-between" alignItems="center">
          <Allocation src={`${process.env.PUBLIC_URL}/images/ido/tiers/${yourTier}.svg`} alt="allocation" />
          <AllocationInfo>
            <Flex>
              <img src={`${process.env.PUBLIC_URL}/images/ido/tier.svg`} alt="your-tier" />
              <Text color={isDark ? '#ffffff' : '#292929'} fontSize="34px" fontWeight={800} ml="10px">{`Your Tier : ${
                yourTier === 'none_tier' ? 'None' : yourTier
              }`}</Text>
            </Flex>
            {account ? (
              <>
                <TokenEconomic justifyContent="space-between">
                  <Text color={isDark ? '#9A97C4' : '#5E4BAF'} fontSize="14px" lineHeight="32px" fontWeight={600}>
                    YOUR ESTIMATED ALLOCATION
                  </Text>
                  <Text color={isDark ? '#ffffff' : '#292929'} fontSize="16px" lineHeight="32px" fontWeight={600}>
                    {`${allocationValue.toFixed(2)} AP`}
                  </Text>
                </TokenEconomic>
                <TokenEconomic justifyContent="space-between">
                  <Text color={isDark ? '#9A97C4' : '#5E4BAF'} fontSize="14px" lineHeight="32px" fontWeight={600}>
                    YOUR STAKE
                  </Text>
                  <Text color={isDark ? '#ffffff' : '#292929'} fontSize="16px" lineHeight="32px" fontWeight={600}>
                    {`${launchpadStaked.toFixed(3)} iPEFI`}
                  </Text>
                </TokenEconomic>
                <TokenEconomic justifyContent="space-between">
                  <Text color={isDark ? '#9A97C4' : '#5E4BAF'} fontSize="14px" lineHeight="32px" fontWeight={600}>
                    PRICE PER KITTY
                  </Text>
                  <Text color={isDark ? '#ffffff' : '#292929'} fontSize="16px" lineHeight="32px" fontWeight={600}>
                    {` $0.045`}
                  </Text>
                </TokenEconomic>
              </>
            ) : (
              <>
                <WalletConnectContainer>
                  <img src={`${process.env.PUBLIC_URL}/images/ido/pefi_white_logo.svg`} alt="pefi locked" />
                  <StyledUnlockButton />
                </WalletConnectContainer>
              </>
            )}
          </AllocationInfo>
        </TierInfo>
        <AllocationsFooter justifyContent="space-around">
          {TIERS.map((tier, index) => {
            return (
              <React.Fragment key={tier.label}>
                <Flex alignItems="center" className="allocation">
                  {tier.label === yourTier && (
                    <img src={`${process.env.PUBLIC_URL}/images/ido/footer-tier.svg`} alt="active-tier" />
                  )}
                  <TierLabel active={tier.label === yourTier}>{tier.label}</TierLabel>
                  <TierTag active={tier.label === yourTier}>{`+${tier.requiredIPEFI} iPEFI`}</TierTag>
                </Flex>
                {index < TIERS.length - 1 && isXl && (
                  <Connector alignItems="center">
                    <div className="prev-connector" />
                    <div className="connect-line" />
                    <div className="next-connector" />
                  </Connector>
                )}
              </React.Fragment>
            )
          })}
        </AllocationsFooter>
      </AllocationsContainer>
    )
  }

  const renderAbout = () => {
    return (
      <IdoDetails>
        <IntroductionImage src={`${process.env.PUBLIC_URL}/images/ido/introduction_kitty.jpg`} />
        <HeaderTitle fontSize="34px" color="#313131" fontWeight={800} mt="50px" mb="8px">
          About the BinaryCat Project
        </HeaderTitle>
        <Text fontSize="16px" lineHeight="24px" color={isDark ? '#9A97C4' : '#7F7F7F'} mt="24px">
          Binary Cat is a decentralized prediction market protocol running on Avalanche that allows users to make bets
          on the price of crypto assets and the relationship between them. The platform is transparent, fully
          decentralized, and has fair reward distribution mechanisms in place.
        </Text>
        <Text fontSize="16px" lineHeight="24px" color={isDark ? '#9A97C4' : '#7F7F7F'} mt="24px">
          Users receive rewards in KITTY tokens (the native token of BinaryCat) as an incentive for betting, even if the
          user bet for the wrong outcome. The amount of KITTY they receive is proportional to the size of their bet in
          relation to the entire group of bets. Bets occur in 5 minutes cycles; in each cycle, bets on the next time
          window are open while the results of the last window are being resolved.
        </Text>
        <Text fontSize="16px" lineHeight="24px" color={isDark ? '#9A97C4' : '#7F7F7F'} mt="24px">
          The platform was built with focus on user experience. It&apos;s really easy to bet directly from your Metamask
          wallet, and the dApp can be accessed from both a web browser or mobile!
        </Text>
        <Text fontSize="16px" lineHeight="24px" color={isDark ? '#9A97C4' : '#7F7F7F'} mt="24px">
          As a decentralized platform, Binary Cat has the ultimate goal of empowering users by holding their KITTY
          tokens. KITTY holders receive all the revenue generated from the platform and will be able to vote on betting
          parameters and which new assets to add.
        </Text>
        {/* key features */}
        <>
          <Text bold fontSize="16px" lineHeight="24px" color={isDark ? '#9A97C4' : '#7F7F7F'} mt="24px">
            Key Features
          </Text>
          <Text fontSize="16px" lineHeight="24px" color={isDark ? '#9A97C4' : '#7F7F7F'} mt="24px">
            • Intuitive user interface.
          </Text>
          <Text fontSize="16px" lineHeight="24px" color={isDark ? '#9A97C4' : '#7F7F7F'} mt="24px">
            • Fully decentralized.
          </Text>
          <Text fontSize="16px" lineHeight="24px" color={isDark ? '#9A97C4' : '#7F7F7F'} mt="24px">
            • Fair and easy to understand reward structure
          </Text>
          <Text fontSize="16px" lineHeight="24px" color={isDark ? '#9A97C4' : '#7F7F7F'} mt="24px">
            • Rewards for every bet (even if lost).
          </Text>
          <Text fontSize="16px" lineHeight="24px" color={isDark ? '#9A97C4' : '#7F7F7F'} mt="24px">
            • Cyclical bets: bets are always open.
          </Text>
        </>
        {/* key features */}
        <>
          <Text bold fontSize="16px" mb="24px" lineHeight="24px" color={isDark ? '#9A97C4' : '#7F7F7F'} mt="24px">
            Tokenomics
          </Text>
          <img src={`${process.env.PUBLIC_URL}/images/ido/binaryCat/tokennomics.png`} alt="tokennomics" />
        </>
        {/* Roadmap */}
        <>
          <Text bold fontSize="16px" mb="24px" lineHeight="24px" color={isDark ? '#9A97C4' : '#7F7F7F'} mt="24px">
            Roadmap
          </Text>
          <img src={`${process.env.PUBLIC_URL}/images/ido/binaryCat/roadmap.png`} alt="roadmap" />
        </>
      </IdoDetails>
    )
  }

  const renderIntroduction = () => {
    switch (activeTab) {
      case 'launchpad':
        return renderLaunchpadInfo()
      case 'token-info':
        return renderTokenInfo()
      case 'about':
        return renderAbout()
      case 'allocations':
        return renderTokenAllocation()
      default:
        return null
    }
  }

  return (
    <Container>
      <MaskBgContainer />
      <MaskBgImageContainer />
      <LaunchpadPage>
        <Text pb="36px" pt="36px" fontSize="41px" fontWeight={800} color="#fff">
          Project Details
        </Text>
        <Flex>
          {TABS.map((tab) => {
            return (
              <TabHead active={tab.value === activeTab} key={tab.value} onClick={handleChangeActiveTab(tab.value)}>
                {isMobile ? tab.smLabel : tab.label}
              </TabHead>
            )
          })}
        </Flex>
        <IntroductionContainer>{renderIntroduction()}</IntroductionContainer>
      </LaunchpadPage>
      <SignUpContainer>
        <SignUpImage src={`${process.env.PUBLIC_URL}/images/ido/signup_banner.png`} />
        <SignUpDetails justifyContent="space-around" alignItems="center">
          <div className="signup-button">
            <SignUpLabel color="white" fontSize="31px" fontWeight={800}>
              Get Alerts For New Launches
            </SignUpLabel>
            <StyledButton onClick={handleSignUp} mt="20px">
              Sign Up
            </StyledButton>
          </div>
        </SignUpDetails>
      </SignUpContainer>
    </Container>
  )
}

const TabHead = styled.div<{ active?: boolean }>`
  background: ${({ active, theme }) => !theme.isDark && active && '#FFFFFF'};
  background: ${({ active, theme }) => !theme.isDark && !active && '#CBC5E4'};
  background: ${({ active, theme }) => theme.isDark && active && '#30264F'};
  background: ${({ active, theme }) => theme.isDark && !active && '#1C163C'};
  color: ${({ active, theme }) => !theme.isDark && active && '#5E4BAF'};
  color: ${({ active, theme }) => !theme.isDark && !active && '#797293'};
  color: ${({ active, theme }) => theme.isDark && active && '#ffffff'};
  color: ${({ active, theme }) => theme.isDark && !active && '#676284'};
  font-size: 12px;
  // line-height: 24px;
  padding: 8px 8px;
  border-radius: 8px 8px 0 0;
  margin-right: 4px;
  cursor: pointer;

  @media (min-width: 640px) {
    border-radius: 15px 15px 0 0;
    padding: 4px 16px;
    font-size: 16px;
    line-height: 24px;
  }
  @media (min-width: 968px) {
    padding: 8px 30px;
  }
`

const TokenEconomic = styled(Flex)`
  border-bottom: 1px solid #dcdcdc;
  border-color: ${({ theme }) => (theme.isDark ? '#676184' : '#dcdcdc')};
  padding-top: 16px;
  padding-bottom: 16px;

  div {
    padding-left: 0;
    padding-right: 0;
    line-height: 14px;
    line-height: 16px;

    &:first-child {
      text-transform: uppercase;
    }

    &:last-child {
      padding-left: 16px;
      padding-right: 16px;
    }

    @media (min-width: 640px) {
      padding-left: 16px;
      padding-right: 16px;
    }
  }
`

const TokenSalesEconomics = styled.div`
  max-width: 100%;
`

const IntroductionImage = styled.img`
  width: 100%;
  border-radius: 16px;
`

const Container = styled.div`
  position: relative;
`

const HeaderTitle = styled(Text)`
  font-size: 26px;
  line-height: 1;
  color: ${({ theme }) => theme.isDark && '#ffffff'};
  @media (min-width: 640px) {
    font-size: 34px;
    line-height: 1.5;
  }
`

const LaunchpadPage = styled(Page)`
  max-width: 1200px;
  padding-bottom: 0px !important;
  padding-top: 0px;
  min-height: auto !important;
`

const MaskBgContainer = styled.div`
  background-size: cover;
  position: absolute;
  top: 0px;
  bottom: 0px;
  right: 0px;
  left: 0px;
  z-index: -1;
  background: ${({ theme }) => !theme.isDark && `linear-gradient(204.54deg, #2a2844 39.75%, #1f2426 139.73%)`};
  background: ${({ theme }) =>
    theme.isDark &&
    `linear-gradient(
    147.1deg,
    rgba(196, 196, 196, 0.397614) -41.44%,
    rgba(196, 196, 196, 0) -3.99%,
    rgba(196, 196, 196, 0.4) 18.11%,
    rgba(196, 196, 196, 0) 49.97%,
    rgba(196, 196, 196, 0) 83.39%
  )`};
`

const MaskBgImageContainer = styled.div`
  background-image: ${({ theme }) => theme.isDark && `url('/images/ido/mask_dark.png')`};
  background-image: ${({ theme }) => !theme.isDark && `url('/images/ido/mask_light.png')`};
  background-size: cover;
  position: absolute;
  top: 0px;
  bottom: 0px;
  right: 0px;
  left: 0px;
  z-index: -1;
`

const IntroductionContainer = styled.div`
  background: ${({ theme }) => (theme.isDark ? '#30264F' : '#ffffff')};
  box-shadow: ${({ theme }) =>
    theme.isDark
      ? `0px 121px 174px rgba(33, 6, 49, 0.1), 0px 61.2562px 75.8531px rgba(33, 6, 49, 0.0675),
    0px 24.2px 28.275px rgba(33, 6, 49, 0.05), 0px 5.29375px 10.0594px rgba(33, 6, 49, 0.0325)`
      : `0px 121px 174px rgba(33, 6, 49, 0.1), 0px 61.2562px 75.8531px rgba(33, 6, 49, 0.0675),
    0px 24.2px 28.275px rgba(33, 6, 49, 0.05), 0px 5.29375px 10.0594px rgba(33, 6, 49, 0.0325)`};
  border-radius: 0 20px 20px;
`

const IdoDetails = styled.div`
  padding: 20px;
  padding-bottom: 32px;
  overflow-y: auto;
  max-height: 482px;

  @media (min-width: 768px) {
    padding: 32px;
    padding-bottom: 48px;
    max-height: 589px;
  }
  @media (min-width: 968px) {
    padding: 35px;
    padding-bottom: 60px;
  }
`

const IdoDetailsContainer = styled.div`
  padding: 30px 20px;
  padding-bottom: 48px;

  @media (min-width: 768px) {
    padding: 48px 32px;
    padding-bottom: 72px;
  }
  @media (min-width: 968px) {
    padding: 60px 36px;
    padding-bottom: 100px;
  }
`

const AllocationsContainer = styled.div`
  padding: 30px 20px 16px;

  @media (min-width: 768px) {
    padding: 48px 32px 16px;
  }
  @media (min-width: 968px) {
    padding: 60px 36px 16px;
  }
`

const Allocation = styled.img`
  max-width: 360px;
`

const AllocationInfo = styled.div`
  max-width: 570px;
  width: 100%;
`
const WalletConnectContainer = styled(Flex)`
  flex-direction: column;
  background: ${({ theme }) => (theme.isDark ? '#3C3061' : '#f2f2f2')};
  border-radius: 10px;
  height: 218px;
  padding: 35px;
  margin-top: 35px;
  background: ${({ theme }) => (theme.isDark ? '#3C3061' : '#f2f2f2')};

  img {
    width: 64px;
    margin: 0px auto;
    opacity: 0.3;
  }
`

const StyledUnlockButton = styled(UnlockButton)`
  width: 100%;
  border-radius: 8px;
  max-width: 225px;
  margin: auto;
  margin-top: 26px;
  font-family: 'Kanit';
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 36px;
  border-radius: 10px;
  background: ${({ theme }) => theme.isDark && '#ffffff'};
  color: ${({ theme }) => theme.isDark && '#3C3061'};
  box-shadow: none;
`

const AllocationsFooter = styled(Flex)`
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 24px 0 8px;
  margin-top: 60px;

  @media (min-width: 968px) {
    flex-direction: row;
    border-top: 1px solid #dcdcdc;
  }

  .allocation {
    margin-top: 8px;

    @media (min-width: 968px) {
      margin-top: 0;
    }
  }
`

const TierLabel = styled(Text)<{ active?: boolean }>`
  color: ${({ active }) => (!active ? '#BDBDBD' : '#7405AA')};
  font-weight: ${({ active }) => (active ? 'bold' : 500)};
  margin-left: ${({ active }) => active && '8px'};
`

const TierTag = styled.div<{ active?: boolean }>`
  background: ${({ active }) => (!active ? '#BCBCBC' : '#7405AA')};
  color: white;
  border-radius: 8px;
  margin-left: 8px;
  padding: 4px 8px;
  font-size: 14px;
`

const Connector = styled(Flex)`
  .prev-connector,
  .next-connector {
    background: #e1e1e1;
    height: 4px;
    width: 4px;
    transform: rotate(45deg);
  }
  .connect-line {
    border-top: 1px solid #e1e1e1;
    width: 100px;
  }
`

const TierInfo = styled(Flex)`
  flex-direction: column;

  @media (min-width: 968px) {
    flex-direction: row;
  }
`

const TokenInfoValue = styled(Text)<{ clickable?: boolean }>`
  cursor: ${({ clickable }) => clickable && 'pointer'};
  color: ${({ theme }) => theme.isDark && '#ffffff'};
`

// sign up container
const SignUpContainer = styled(Page)`
  max-width: 1200px;
  position: relative;
  margin-top: 20px;
  margin: auto;
  min-height: auto;

  @media (min-width: 900px) {
    margin-top: 0px;
    padding-top: 41px;
    padding-bottom: 41px;
  }
`

const SignUpImage = styled.img`
  width: 100%;
  background: linear-gradient(180deg, #7361be 0%, #3a258f 100%);
  border-radius: 10px;
  min-height: 200px;
  object-fit: cover;
`

const SignUpDetails = styled(Flex)`
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translate(0, -50%);
  min-height: 200px;

  .signup-button {
    width: 80%;

    @media (min-width: 768px) {
      width: 70%;
    }
  }

  @media (min-width: 768px) {
    top: 0;
    bottom: 0;
    transform: unset;
  }
`

const SignUpLabel = styled(Text)`
  font-size: 24px;

  @media (min-width: 768px) {
    font-size: 31px;
  }
`

const StyledButton = styled(Button)`
  box-shadow: none;
  width: 180px;
  height: 48px;
  border-radius: 5px;
  background: white;
  color: #620aa8;
  font-size: 20px;
  font-weight: 500;

  @media (min-width: 768px) {
    font-size: 24px;
    width: 240px;
    height: 54px;
  }

  &:hover:not(:disabled):not(.penguin-button--disabled):not(.penguin-button--disabled):not(:active) {
    opacity: 1;
  }
`

export default ProjectDetailsCardRegistration
