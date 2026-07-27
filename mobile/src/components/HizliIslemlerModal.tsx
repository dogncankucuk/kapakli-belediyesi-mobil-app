import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SERVICE_CATALOG, ServiceId } from "../constants/serviceCatalog";
import { useTranslation } from "../i18n/LocaleContext";
import { Colors, shape, spacing, typography, useThemeColors } from "../theme";

type HizliIslemlerModalProps = {
  visible: boolean;
  selectedIds: ServiceId[];
  onClose: () => void;
  onSave: (ids: ServiceId[]) => void;
};

export default function HizliIslemlerModal({
  visible,
  selectedIds,
  onClose,
  onSave,
}: HizliIslemlerModalProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draft, setDraft] = useState<ServiceId[]>(selectedIds);

  const toggle = (id: ServiceId) => {
    setDraft((current) =>
      current.includes(id)
        ? current.filter((existing) => existing !== id)
        : [...current, id],
    );
  };

  const handleShow = () => {
    setDraft(selectedIds);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleShow}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("common_cancel")}
          >
            <MaterialIcons name="close" size={24} color={colors.onBackground} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {t("home_quickActionsEdit")}
          </Text>
          <Pressable
            onPress={() => onSave(draft)}
            hitSlop={8}
            accessibilityRole="button"
            disabled={draft.length === 0}
          >
            <Text
              style={[
                styles.saveLabel,
                draft.length === 0 && styles.saveLabelDisabled,
              ]}
            >
              {t("common_save")}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>{t("home_quickActionsEditHint")}</Text>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {SERVICE_CATALOG.map((service) => {
            const isSelected = draft.includes(service.id);
            return (
              <Pressable
                key={service.id}
                onPress={() => toggle(service.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                style={styles.row}
              >
                <MaterialIcons
                  name={service.icon}
                  size={22}
                  color={colors.primaryContainer}
                />
                <Text style={styles.rowLabel}>{t(service.labelKey)}</Text>
                <MaterialIcons
                  name={isSelected ? "check-box" : "check-box-outline-blank"}
                  size={22}
                  color={isSelected ? colors.primaryContainer : colors.outline}
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.stackGap,
      paddingHorizontal: spacing.containerMargin,
      paddingVertical: spacing.stackGap,
    },
    headerTitle: {
      ...typography.titleMd,
      color: colors.onBackground,
      flex: 1,
      textAlign: "center",
    },
    saveLabel: {
      ...typography.labelLg,
      color: colors.primaryContainer,
    },
    saveLabelDisabled: {
      color: colors.outline,
    },
    hint: {
      ...typography.bodyMd,
      color: colors.outline,
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
    },
    list: {
      paddingHorizontal: spacing.containerMargin,
      paddingBottom: spacing.stackGap,
      gap: spacing.stackGap / 2,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.stackGap,
      minHeight: spacing.touchTargetMin,
      paddingHorizontal: spacing.stackGap / 2,
      borderRadius: shape.rounded,
      backgroundColor: colors.surfaceContainerLowest,
    },
    rowLabel: {
      ...typography.bodyLg,
      color: colors.onBackground,
      flex: 1,
    },
  });
