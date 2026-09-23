const AUTOMATED_LABEL_PATTERN = /\s*(?:[·•|\-–—]\s*)?(?:bot|assistente virtual|personagem virtual)\s*$/i;

export const cleanDisplayName = (value?: string | null): string => {
  const name = value?.trim();
  if (!name) return 'Usuário';
  return name.replace(AUTOMATED_LABEL_PATTERN, '').trim() || 'Usuário';
};

export const looksLikeAutomatedProfile = (value?: string | null): boolean =>
  Boolean(value && /\b(?:bot|assistente virtual|personagem virtual)\b/i.test(value));
