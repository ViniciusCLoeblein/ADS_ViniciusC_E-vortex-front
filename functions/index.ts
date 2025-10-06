import Toast from 'react-native-toast-message'

type ToastType = 'error' | 'success' | 'info'

const colorMap: Record<ToastType, string> = {
  error: 'red',
  success: '#00b2a6',
  info: '#2563EB',
}

function show(type: ToastType, title: string, subtitle?: string) {
  Toast.show({
    type,
    text1: title,
    text2: subtitle,
    text1Style: {
      fontSize: 16,
      fontFamily: 'Fustat-Bold',
      color: colorMap[type],
    },
    text2Style: {
      fontSize: 10,
      fontFamily: 'Fustat-Medium',
      color: 'black',
    },
    swipeable: true,
    autoHide: true,
  })
}

export const toast = {
  success: (title: string, subtitle?: string) =>
    show('success', title, subtitle),
  error: (title: string, subtitle?: string) => show('error', title, subtitle),
  info: (title: string, subtitle?: string) => show('info', title, subtitle),
}
