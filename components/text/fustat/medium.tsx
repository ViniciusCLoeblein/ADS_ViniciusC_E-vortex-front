import { cn } from '@/lib/utils'
import { Text, TextProps, StyleSheet } from 'react-native'

export const FustatMedium = ({ style, ...props }: TextProps) => {
  return (
    <Text
      {...props}
      allowFontScaling={false}
      style={[styles.text, style]}
      className={cn(props.className, {
        'text-black': !props.className?.includes('text-'),
      })}
    />
  )
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Fustat-Medium',
  },
})
