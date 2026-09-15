import { useState } from "react";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "../../web/ui";
import type { ViewStyle } from "../../web/ui";
import { radius, shadows, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

interface TooltipProps {
    label?: string;
    children: ReactNode;
    fill?: boolean;
    wrapperStyle?: ViewStyle | ViewStyle[];
}

export default function Tooltip({
    label,
    children,
    fill = false,
    wrapperStyle,
}: TooltipProps) {
    const { theme } = useSettings();
    const colors = theme.colors;
    const [isVisible, setIsVisible] = useState(false);

    if (!label) {
        return <>{children}</>;
    }

    return (
        <View
            style={[
                styles.wrapper,
                fill && styles.fillWrapper,
                wrapperStyle,
            ]}
            onPointerEnter={() => setIsVisible(true)}
            onPointerLeave={() => setIsVisible(false)}
        >
            {children}

            {isVisible && (
                <View
                    pointerEvents="none"
                    style={[
                        styles.tooltip,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.tooltipText,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {label}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "relative",
        alignSelf: "flex-start",
        overflow: "visible",
    },

    fillWrapper: {
        width: "100%",
        alignSelf: "stretch",
    },

    tooltip: {
        position: "absolute",
        left: "50%",
        bottom: "calc(100% + 6px)",
        transform: "translateX(-50%)",
        width: "max-content",
        maxWidth: 180,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderWidth: 1,
        borderRadius: radius.sm,
        zIndex: 100,
        pointerEvents: "none",
        ...shadows.sm,
    },

    tooltipText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        textAlign: "center",
        whiteSpace: "nowrap",
    },
});