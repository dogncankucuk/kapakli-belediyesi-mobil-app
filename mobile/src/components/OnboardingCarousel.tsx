import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PaginationDots from "./PaginationDots";
import PrimaryButton from "./PrimaryButton";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

export type OnboardingSlide = {
  key: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  illustrationBg: string;
  title: string;
  description: string;
};

type OnboardingCarouselProps = {
  slides: OnboardingSlide[];
  onDone: () => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OnboardingCarousel({
  slides,
  onDone,
}: OnboardingCarouselProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLast = activeIndex === slides.length - 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const goNext = () => {
    if (isLast) {
      onDone();
      return;
    }
    scrollRef.current?.scrollTo({
      x: (activeIndex + 1) * SCREEN_WIDTH,
      animated: true,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Pressable
        onPress={onDone}
        accessibilityRole="button"
        style={styles.skip}
      >
        <Text style={styles.skipText}>Atla</Text>
      </Pressable>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View
              style={[
                styles.illustration,
                { backgroundColor: slide.illustrationBg },
              ]}
            >
              <MaterialIcons
                name={slide.icon}
                size={72}
                color={colors.primaryContainer}
              />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <PaginationDots count={slides.length} activeIndex={activeIndex} />
        <PrimaryButton
          label={isLast ? "Hemen Başla" : "Devam Et"}
          onPress={goNext}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    skip: {
      alignSelf: "flex-end",
      padding: spacing.containerMargin,
    },
    skipText: {
      ...typography.labelLg,
      color: colors.outline,
    },
    slide: {
      alignItems: "center",
      paddingHorizontal: spacing.containerMargin * 1.5,
      paddingTop: spacing.containerMargin,
    },
    illustration: {
      width: "100%",
      aspectRatio: 1.1,
      borderRadius: shape.roundedXl,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.containerMargin * 1.5,
    },
    title: {
      ...typography.headlineMdMobile,
      color: colors.onBackground,
      textAlign: "center",
      marginBottom: spacing.stackGap / 2,
    },
    description: {
      ...typography.bodyLg,
      color: colors.outline,
      textAlign: "center",
    },
    footer: {
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.containerMargin * 1.5,
      gap: spacing.containerMargin,
      alignItems: "center",
    },
    button: {
      width: "100%",
    },
  });
