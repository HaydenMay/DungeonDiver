const STORAGE_KEY = 'dungeondiver.vault.v1';

export function saveVault(vault) {
  try {
    const clean = vault.map((item) => (item ? {
      id: item.id,
      name: item.name,
      slot: item.slot,
      rarity: item.rarity,
      rarityColor: item.rarityColor,
      stat: item.stat,
      value: item.value,
      tier: item.tier || 0,
    } : null));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    return true;
  } catch (e) {
    return false;
  }
}

export function loadVault() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 2) return null;
    return parsed.map((item) => (item ? { ...item } : null));
  } catch (e) {
    return null;
  }
}

export function clearVault() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

export function hasSavedVault() {
  return loadVault() !== null && loadVault().some((i) => i !== null);
}
