import { Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { pick } from '../../utils/i18nData';
import { BADGE_BY_ID, LEVELS } from '../../utils/journey';
import { Button, Sheet } from '../ui';
import BadgeEmblem from './BadgeEmblem';

// Folha de conquista desbloqueada (e de novo nível). Entra com a mola do
// Sheet; cada emblema cresce com ZoomIn e o texto desce em cascata. Para
// várias conquistas de uma vez (raro) empilha todas. `levelUp` é o nível
// novo (objeto de LEVELS) quando o XP cruzou um limiar nesta mesma rodada.
export default function BadgeUnlockSheet({ visible, badgeIds = [], levelUp, onClose }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, motion } = tokens;
  const badges = badgeIds.map((id) => BADGE_BY_ID.get(id)).filter(Boolean);
  const items = [];
  if (levelUp) items.push({ key: `level-${levelUp.id}`, id: levelUp.id, icon: 'star', label: t('journey.levelUp'), name: pick(levelUp, 'name', isEn), desc: `${t('journey.level')} ${LEVELS.indexOf(levelUp) + 1}` });
  for (const b of badges) items.push({ key: b.id, id: b.id, icon: b.icon, label: t('journey.badgeUnlocked'), name: pick(b, 'name', isEn), desc: pick(b, 'desc', isEn) });
  const title = badges.length > 1 ? t('journey.badgesUnlocked', { n: badges.length }) : items[0]?.label;

  return (
    <Sheet visible={visible && items.length > 0} onClose={onClose} title={title}>
      <View style={{ gap: space.lg, paddingVertical: space.sm }}>
        {items.map((it, i) => (
          <View key={it.key} style={{ alignItems: 'center', gap: space.xs }}>
            <Animated.View entering={ZoomIn.duration(motion.spring).delay(i * motion.stagger * 3).springify().damping(14)}>
              <BadgeEmblem id={it.id} icon={it.icon} size="lg" />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(motion.layout).delay(120 + i * motion.stagger * 3)} style={{ alignItems: 'center', gap: space.xxs }}>
              <Text role="heading" aria-level={2} style={[text('section'), { color: colors.text, textAlign: 'center' }]}>{it.name}</Text>
              <Text style={[text('subhead'), { color: colors.textSubtle, textAlign: 'center' }]}>{it.desc}</Text>
            </Animated.View>
          </View>
        ))}
        <Button label={t('journey.continue')} onPress={onClose} haptic="impact" />
      </View>
    </Sheet>
  );
}
