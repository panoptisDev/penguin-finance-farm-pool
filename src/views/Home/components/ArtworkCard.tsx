import React from 'react'
import styled from 'styled-components'
import { Card, useMatchBreakpoints } from 'penguinfinance-uikit2'
import { useHistory } from 'react-router-dom'

const ArtworkCard = () => {
  const history = useHistory()
  const { isXl } = useMatchBreakpoints()
  const isMobile = !isXl
  const onClickArtworkV2Card = () => {
    history.push('/club')
    // window.open(
    //   'https://penguin-finance.medium.com/the-club-penguin-initiative-is-live-on-avalanche-9cd08a133f2',
    //   '_blank',
    // )
  }

  return (
    <StyledArtworkCard isMobile={isMobile}>
      <StyledArtworkCardBg onClick={onClickArtworkV2Card} />
    </StyledArtworkCard>
  )
}

const StyledArtworkCard = styled(Card)<{ isMobile?: boolean }>`
  height: ${({ isMobile }) => (isMobile ? 'calc(50vw - 16px)' : '230px')};
  margin-bottom: 24px;
  background: ${({ theme }) => theme.isDark && '#30264F'};
`

const StyledArtworkCardBg = styled.div`
  height: 100%;
  background-size: cover;
  background-position: center center;
  background-image: url('/images/launchpad/club_penguin_live.png');
  cursor: pointer;
`

export default ArtworkCard
