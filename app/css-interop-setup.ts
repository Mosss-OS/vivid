import { cssInterop } from 'react-native-css-interop';
import { MotiView } from 'moti';
import { MotiText } from 'moti/build/components';

cssInterop(MotiView, { className: 'style' });
cssInterop(MotiText, { className: 'style' });