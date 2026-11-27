import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radius, space, type } from '../theme/tokens';

const QUOTE_URL = 'https://dummyjson.com/quotes/random';

type FetchState = 'loading' | 'error' | 'empty' | 'data';

type Quote = {
  quote: string;
  author: string;
};

export function QuoteOfTheDay() {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<FetchState>('loading');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let active = true;

    setPhase('loading');

    async function loadQuote() {
      try {
        const response = await fetch(QUOTE_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Quote request failed (${response.status})`);
        }

        const body = (await response.json()) as { quote?: unknown; author?: unknown };
        if (!active) return;

        const text = typeof body.quote === 'string' ? body.quote.trim() : '';
        const author = typeof body.author === 'string' ? body.author.trim() : '';
        if (!text) {
          setQuote(null);
          setPhase('empty');
          return;
        }

        setQuote({ quote: text, author: author || 'Unknown' });
        setPhase('data');
      } catch {
        if (!active) return;
        setQuote(null);
        setPhase('error');
      } finally {
        clearTimeout(timer);
      }
    }

    void loadQuote();

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [reloadKey]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.muted }]}>Quote of the day</Text>
      <View style={styles.body}>
        {phase === 'loading' ? (
          <View style={styles.row}>
            <ActivityIndicator color={colors.accent} />
            <Text style={[styles.status, { color: colors.muted }]}>Loading quote...</Text>
          </View>
        ) : null}
        {phase === 'error' ? (
          <View style={styles.row}>
            <Text style={[styles.status, { color: colors.danger }]}>Could not load a quote.</Text>
            <Pressable onPress={() => setReloadKey((key) => key + 1)} hitSlop={8}>
              <Text style={[styles.retry, { color: colors.accent }]}>Retry</Text>
            </Pressable>
          </View>
        ) : null}
        {phase === 'empty' ? (
          <Text style={[styles.status, { color: colors.muted }]}>No quote came back.</Text>
        ) : null}
        {phase === 'data' && quote ? (
          <View>
            <Text style={[styles.quote, { color: colors.text }]} numberOfLines={3}>
              “{quote.quote}”
            </Text>
            <Text style={[styles.author, { color: colors.accent }]} numberOfLines={1}>
              {quote.author}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    marginHorizontal: space.lg,
    marginTop: space.sm,
    marginBottom: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    gap: space.sm,
  },
  label: {
    fontSize: type.caption,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  body: {
    minHeight: 44,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  status: {
    fontSize: type.caption,
    flexShrink: 1,
  },
  retry: {
    fontSize: type.caption,
    fontWeight: '700',
  },
  quote: {
    fontSize: type.caption,
    lineHeight: 18,
  },
  author: {
    marginTop: space.xs,
    fontSize: type.caption,
    fontWeight: '700',
  },
});
