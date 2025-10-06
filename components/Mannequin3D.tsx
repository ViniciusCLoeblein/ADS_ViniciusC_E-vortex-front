import React, { useState, useRef } from 'react'
import { View, Text, PanResponder, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMannequin } from '@/contexts/MannequinContext'

interface Mannequin3DProps {
  size?: number
}

export const Mannequin3D: React.FC<Mannequin3DProps> = ({ size = 200 }) => {
  const { equippedItems } = useMannequin()
  const [rotation, setRotation] = useState(0)
  const lastRotation = useRef(0)
  const lastPanX = useRef(0)

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      lastPanX.current = 0
    },
    onPanResponderMove: (evt, gestureState) => {
      const deltaX = gestureState.dx - lastPanX.current
      const newRotation = lastRotation.current + deltaX * 0.5
      setRotation(newRotation)
      lastPanX.current = gestureState.dx
    },
    onPanResponderRelease: () => {
      lastRotation.current = rotation
    },
  })

  const getCurrentSide = () => {
    const normalizedRotation = ((rotation % 360) + 360) % 360
    if (normalizedRotation > 90 && normalizedRotation < 270) {
      return 'back'
    }
    return 'front'
  }

  const resetRotation = () => {
    setRotation(0)
    lastRotation.current = 0
  }

  const renderMannequinBody = (side: 'front' | 'back') => {
    const isBack = side === 'back'
    const centerX = size / 2

    return (
      <View
        style={{
          width: size,
          height: size * 1.4,
          position: 'relative',
          transform: [{ scaleX: isBack ? -1 : 1 }],
        }}
      >
        {/* Cabeça */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.05,
            left: centerX - size * 0.12,
            width: size * 0.24,
            height: size * 0.24,
            borderRadius: size * 0.12,
            backgroundColor: '#F5F5F5',
            borderWidth: 2,
            borderColor: '#E0E0E0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {equippedItems.face && (
            <Image
              source={{ uri: equippedItems.face.image }}
              style={{
                width: size * 0.18,
                height: size * 0.18,
                borderRadius: size * 0.09,
              }}
              resizeMode="cover"
              alt={equippedItems.face.name}
            />
          )}
          {!equippedItems.face && (
            <Ionicons name="person-outline" size={size * 0.1} color="#9FABB9" />
          )}
        </View>

        {/* Cabelo */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.02,
            left: centerX - size * 0.12,
            width: size * 0.24,
            height: size * 0.15,
            borderRadius: size * 0.12,
            backgroundColor: '#8B4513',
            borderWidth: 1,
            borderColor: '#654321',
          }}
        />

        {/* Pescoço */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.25,
            left: centerX - size * 0.025,
            width: size * 0.05,
            height: size * 0.06,
            backgroundColor: '#F5F5F5',
            borderWidth: 1,
            borderColor: '#E0E0E0',
            borderRadius: size * 0.01,
          }}
        />

        {/* Torso */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.3,
            left: centerX - size * 0.15,
            width: size * 0.3,
            height: size * 0.45,
            backgroundColor: equippedItems.torso ? '#4A90E2' : '#F5F5F5',
            borderWidth: 2,
            borderColor: '#E0E0E0',
            borderRadius: size * 0.05,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {equippedItems.torso && (
            <Image
              source={{ uri: equippedItems.torso.image }}
              style={{
                width: size * 0.25,
                height: size * 0.4,
                borderRadius: size * 0.04,
              }}
              resizeMode="cover"
              alt={equippedItems.torso.name}
            />
          )}
          {!equippedItems.torso && (
            <Ionicons name="shirt-outline" size={size * 0.15} color="#9FABB9" />
          )}
        </View>

        {/* Braços */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.35,
            left: centerX - size * 0.25,
            width: size * 0.1,
            height: size * 0.25,
            backgroundColor: '#F5F5F5',
            borderWidth: 1,
            borderColor: '#E0E0E0',
            borderRadius: size * 0.05,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: size * 0.35,
            right: centerX - size * 0.25,
            width: size * 0.1,
            height: size * 0.25,
            backgroundColor: '#F5F5F5',
            borderWidth: 1,
            borderColor: '#E0E0E0',
            borderRadius: size * 0.05,
          }}
        />

        {/* Mãos */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.55,
            left: centerX - size * 0.23,
            width: size * 0.06,
            height: size * 0.06,
            borderRadius: size * 0.03,
            backgroundColor: '#F5F5F5',
            borderWidth: 1,
            borderColor: '#E0E0E0',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: size * 0.55,
            right: centerX - size * 0.23,
            width: size * 0.06,
            height: size * 0.06,
            borderRadius: size * 0.03,
            backgroundColor: '#F5F5F5',
            borderWidth: 1,
            borderColor: '#E0E0E0',
          }}
        />

        {/* Quadris */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.7,
            left: centerX - size * 0.08,
            width: size * 0.16,
            height: size * 0.1,
            backgroundColor: equippedItems.torso ? '#4A90E2' : '#F5F5F5',
            borderWidth: 2,
            borderColor: '#E0E0E0',
            borderRadius: size * 0.02,
          }}
        />

        {/* Pernas */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.8,
            left: centerX - size * 0.12,
            width: size * 0.06,
            height: size * 0.35,
            backgroundColor: '#2C3E50',
            borderWidth: 1,
            borderColor: '#1A252F',
            borderRadius: size * 0.03,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: size * 0.8,
            right: centerX - size * 0.12,
            width: size * 0.06,
            height: size * 0.35,
            backgroundColor: '#2C3E50',
            borderWidth: 1,
            borderColor: '#1A252F',
            borderRadius: size * 0.03,
          }}
        />

        {/* Pés */}
        <View
          style={{
            position: 'absolute',
            top: size * 1.1,
            left: centerX - size * 0.08,
            width: size * 0.12,
            height: size * 0.06,
            borderRadius: size * 0.03,
            backgroundColor: equippedItems.feet ? '#E74C3C' : '#34495E',
            borderWidth: 1,
            borderColor: '#2C3E50',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: size * 1.1,
            right: centerX - size * 0.08,
            width: size * 0.12,
            height: size * 0.06,
            borderRadius: size * 0.03,
            backgroundColor: equippedItems.feet ? '#E74C3C' : '#34495E',
            borderWidth: 1,
            borderColor: '#2C3E50',
          }}
        />

        {/* Detalhes faciais (apenas na frente) */}
        {!isBack && (
          <>
            {/* Olhos */}
            <View
              style={{
                position: 'absolute',
                top: size * 0.12,
                left: centerX - size * 0.04,
                width: size * 0.016,
                height: size * 0.016,
                borderRadius: size * 0.008,
                backgroundColor: '#333',
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: size * 0.12,
                right: centerX - size * 0.04,
                width: size * 0.016,
                height: size * 0.016,
                borderRadius: size * 0.008,
                backgroundColor: '#333',
              }}
            />

            {/* Nariz */}
            <View
              style={{
                position: 'absolute',
                top: size * 0.15,
                left: centerX - size * 0.008,
                width: size * 0.016,
                height: size * 0.02,
                backgroundColor: '#333',
                borderRadius: size * 0.008,
              }}
            />

            {/* Boca */}
            <View
              style={{
                position: 'absolute',
                top: size * 0.18,
                left: centerX - size * 0.025,
                width: size * 0.05,
                height: size * 0.01,
                backgroundColor: '#333',
                borderRadius: size * 0.005,
              }}
            />
          </>
        )}

        {/* Indicador de item equipado */}
        {equippedItems.torso && (
          <View
            style={{
              position: 'absolute',
              top: size * 0.5,
              left: centerX - size * 0.02,
              width: size * 0.04,
              height: size * 0.04,
              borderRadius: size * 0.02,
              backgroundColor: '#27AE60',
              borderWidth: 2,
              borderColor: '#FFFFFF',
            }}
          />
        )}
        {equippedItems.feet && (
          <>
            <View
              style={{
                position: 'absolute',
                top: size * 1.1,
                left: centerX - size * 0.08,
                width: size * 0.03,
                height: size * 0.03,
                borderRadius: size * 0.015,
                backgroundColor: '#27AE60',
                borderWidth: 1,
                borderColor: '#FFFFFF',
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: size * 1.1,
                right: centerX - size * 0.08,
                width: size * 0.03,
                height: size * 0.03,
                borderRadius: size * 0.015,
                backgroundColor: '#27AE60',
                borderWidth: 1,
                borderColor: '#FFFFFF',
              }}
            />
          </>
        )}
      </View>
    )
  }

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      {/* Rotation Controls */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons name="refresh-outline" size={20} color="#9FABB9" />
        <Text
          style={{
            marginLeft: 8,
            color: '#9FABB9',
            fontSize: 14,
            fontWeight: '500',
          }}
        >
          Arraste para girar
        </Text>
        <TouchableOpacity onPress={resetRotation} style={{ marginLeft: 10 }}>
          <Ionicons name="refresh" size={16} color="#437C99" />
        </TouchableOpacity>
      </View>

      {/* 3D Mannequin Container */}
      <View
        {...panResponder.panHandlers}
        style={{
          width: size,
          height: size * 1.4,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ perspective: 1000 }, { rotateY: `${rotation}deg` }],
        }}
      >
        {/* Front Side */}
        <View
          style={{
            position: 'absolute',
            backfaceVisibility: 'hidden',
          }}
        >
          {renderMannequinBody('front')}
        </View>

        {/* Back Side */}
        <View
          style={{
            position: 'absolute',
            backfaceVisibility: 'hidden',
            transform: [{ rotateY: '180deg' }],
          }}
        >
          {renderMannequinBody('back')}
        </View>
      </View>

      {/* Side Indicator */}
      <View
        style={{
          marginTop: 20,
          backgroundColor: 'white',
          paddingHorizontal: 15,
          paddingVertical: 8,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text
          style={{
            color: '#437C99',
            fontSize: 12,
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          {getCurrentSide() === 'front' ? 'Frente' : 'Costas'}
        </Text>
      </View>

      {/* Equipped Items Info */}
      <View
        style={{
          marginTop: 15,
          backgroundColor: 'white',
          paddingHorizontal: 15,
          paddingVertical: 10,
          borderRadius: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
          minWidth: 200,
        }}
      >
        <Text
          style={{
            color: '#437C99',
            fontSize: 12,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 5,
          }}
        >
          Itens Equipados
        </Text>
        <Text
          style={{
            color: '#9FABB9',
            fontSize: 10,
            textAlign: 'center',
          }}
        >
          {equippedItems.torso
            ? `Torso: ${equippedItems.torso.name}`
            : 'Torso: Nenhum'}
        </Text>
        <Text
          style={{
            color: '#9FABB9',
            fontSize: 10,
            textAlign: 'center',
          }}
        >
          {equippedItems.face
            ? `Rosto: ${equippedItems.face.name}`
            : 'Rosto: Nenhum'}
        </Text>
        <Text
          style={{
            color: '#9FABB9',
            fontSize: 10,
            textAlign: 'center',
          }}
        >
          {equippedItems.feet
            ? `Pés: ${equippedItems.feet.name}`
            : 'Pés: Nenhum'}
        </Text>
      </View>
    </View>
  )
}
