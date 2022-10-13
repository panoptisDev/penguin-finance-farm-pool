import { Flex, Button, Text, useMatchBreakpoints } from 'penguinfinance-uikit2';
import React, { useRef } from 'react'
import styled from 'styled-components'

const FCard = styled.div`
  background: ${(props) => props.theme.card.background};
  border-radius: 32px;
  box-shadow: 0px 2px 12px -8px rgba(25, 19, 38, 0.1), 0px 1px 1px rgba(25, 19, 38, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 24px;
  position: relative;
  text-align: center;

  @media (min-width: 640px) {
    min-width: 320px;
    max-width: 100%;
    width: unset;
  }
  @media (min-width: 768px) {
    min-width: 656px;
    max-width: 67%;
    width: 100%;
  }
`;

const StyledButton = styled(Button)`
  width: 100%;
  margin-top: 8px;
  margin-right: 8px;
  margin-left: 8px;

  @media (min-width: 640px) {
    width: 200px;
    margin-top: 16px;
  }
`;

const PangolinButton = styled(StyledButton)`
  background-color: #f97316;
  color: white;
`;

const MigrationVideo = styled.video`
  width: 100%;
  border-radius: 16px;

  @media (min-width: 640px) {
    width: 100%;
    margin-right: 16px;
  }
`;

const MigrationCard: React.FC = () => {
  const videoRef = useRef(null);
  const { isXl } = useMatchBreakpoints()
  const isMobile = !isXl

  const handleViewVideoGuide = () => {
    if (videoRef && videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleViewTextGuide = () => {
    window.open('https://docs.penguinfinance.io/summary/igloos-liquidity-staking/igloo-v2-migration-guide', '_blank');
  };

  const handleGoPangolin = () => {
    window.open('https://app.pangolin.exchange/#/swap', '_blank');
  };

  return (
    <FCard>
      <Flex justifyContent='center'>
        <Text fontSize='20px' color='textSubtle' bold>Migration Guide</Text>
      </Flex>
      <Flex justifyContent='center' mb='16px' flexWrap='wrap'>
        <PangolinButton scale={isMobile ? 'sm' : 'md'} onClick={handleGoPangolin}>Go to Pangolin</PangolinButton>
        <StyledButton scale={isMobile ? 'sm' : 'md'} color='primary' onClick={handleViewVideoGuide}>View Video Guide</StyledButton>
        <StyledButton scale={isMobile ? 'sm' : 'md'} color='primary' onClick={handleViewTextGuide}>View Text Guide</StyledButton>
      </Flex>
      <MigrationVideo ref={videoRef} controls>
        <source src='https://res.cloudinary.com/dbyunrpzq/video/upload/v1631220224/Penguin_Tutorial_qhw7b2.mp4' />
      </MigrationVideo>
    </FCard>
  )
}

export default MigrationCard
