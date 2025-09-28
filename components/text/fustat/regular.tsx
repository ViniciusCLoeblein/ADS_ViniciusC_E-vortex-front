import { Text, TextProps, StyleSheet } from 'react-native'
import { cn } from '@/lib/utils'

export const FustatRegular = ({ style, ...props }: TextProps) => {
  return (
    <Text
      {...props}
      style={[styles.text, style]}
      className={cn(props.className, {
        'text-black': !props.className?.includes('text-'),
      })}
    />
  )
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Fustat-Regular',
  },
})
