import { View, Image } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../lib/theme';

export default function LogoLoader({ size = 120 }: { size?: number }) {
  const { isDark } = useTheme();
  
  return (
    <View className="items-center justify-center">
      <MotiView
        from={{ 
          opacity: 0,
          scale: 0.8,
          rotate: '0deg',
        }}
        animate={{ 
          opacity: 1,
          scale: 1,
          rotate: '360deg',
        }}
        transition={{
          type: 'timing',
          duration: 2000,
          loop: true,
        }}
        style={{
          width: size,
          height: size,
        }}
      >
        <Image
          source={{ uri: 'https://res.cloudinary.com/dv0tt80vn/image/upload/v1777983153/vivid_l3khgo.png' }}
          style={{
            width: size,
            height: size,
            resizeMode: 'contain',
          }}
        />
      </MotiView>
      
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 500 }}
        className="mt-4"
      >
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 1000,
            loop: true,
            repeatReverse: true,
          }}
        >
          <View className={`h-1 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} style={{ width: size * 0.7 }} />
        </MotiView>
      </MotiView>
    </View>
  );
}
