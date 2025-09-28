import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import AntDesign from '@expo/vector-icons/AntDesign'
import Feather from '@expo/vector-icons/Feather'
import Entypo from '@expo/vector-icons/Entypo'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import Foundation from '@expo/vector-icons/Foundation'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Octicons from '@expo/vector-icons/Octicons'
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons'
import Zocial from '@expo/vector-icons/Zocial'

export const Brands = {
  10: 'https://app.evortex.com.br/site/evortex.svg',
  30: 'https://app.evortex.com.br/site/pormenos.svg',
  40: 'https://app.evortex.com.br/site/franco_giorgi.svg',
  50: 'https://app.evortex.com.br/site/tottal.svg',
  70: 'https://app.evortex.com.br/site/gztstore.svg',
}

export const Markers = {
  10: 'https://app.evortex.com.br/site/map/evortex.png',
  30: 'https://app.evortex.com.br/site/map/pormenos.png',
  40: 'https://app.evortex.com.br/site/map/fg.png',
  50: 'https://app.evortex.com.br/site/map/tottal.png',
  70: 'https://app.evortex.com.br/site/map/gzt.png',
}

export const nameNetworks: { [key: number]: string } = {
  10: 'evortex',
  30: 'Por Menos',
  40: 'Franco Giorgi',
  50: 'Tottal',
  70: 'GZT Store',
}

export const companies = [
  {
    image: Brands[70],
    text: 'GZT Store',
    uri: 'https://www.gztstore.com.br/',
  },
  {
    image: Brands[10],
    text: 'evortex',
    uri: 'https://www.gztstore.com.br/evortex/home',
  },
  {
    image: Brands[50],
    text: 'Tottal',
    uri: 'https://www.gztstore.com.br/tottal/home',
  },
  {
    image: Brands[30],
    text: 'Por Menos',
    uri: 'https://www.gztstore.com.br/pormenos/home',
  },
  {
    image: Brands[40],
    text: 'Franco Giorgi',
    uri: 'https://www.gztstore.com.br/franco-giorgi/home',
  },
]

export const iconLibraries = {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome,
  AntDesign,
  Feather,
  Entypo,
  EvilIcons,
  FontAwesome5,
  Foundation,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
}

export const networksReduce: Record<string, 10 | 30 | 40 | 50 | 70> = {
  GRZ: 10,
  PRM: 30,
  FRG: 40,
  TOT: 50,
  GZT: 70,
  E: 70,
}
