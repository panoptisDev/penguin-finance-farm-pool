import React from 'react'
import { Text, useMatchBreakpoints } from 'penguinfinance-uikit2'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import useI18n from 'hooks/useI18n'
import useTheme from 'hooks/useTheme'
import CardValue from './CardValue'

interface PefiHarvestBalanceProps {
  value?: number
  detailedValue?: string
}

const PefiHarvestBalance: React.FC<PefiHarvestBalanceProps> = ({ value, detailedValue }) => {
  const TranslateString = useI18n()
  const { account } = useWeb3React()
  const { isDark } = useTheme()
  const { isXl } = useMatchBreakpoints()
  const isMobile = !isXl

  if (!account) {
    return (
      <Text color="textDisabled" style={{ lineHeight: '32px' }}>
        {TranslateString(298, 'Locked')}
      </Text>
    )
  }

  return (
    <Block>
      <CardValue
        color={isDark ? '#fff' : '#342C6D'}
        fontSize={isMobile ? '30px' : '44px'}
        value={value}
        lineHeight="1.2"
        decimals={2}
        prefix="$"
      />
      <DetailedValue fontSize="12px" style={{ lineHeight: '12px' }}>
        {detailedValue}
      </DetailedValue>
    </Block>
  )
}

const Block = styled.div`
  margin-bottom: 0px;
`

const DetailedValue = styled(Text)`
  color: ${({ theme }) => (theme.isDark ? 'white' : theme.colors.secondary)};
`

export default PefiHarvestBalance
