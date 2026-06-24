export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validName(name: string): boolean {
  return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s'-]+$/.test(name);
}

export function validPassword(password: string): boolean {
  return password.length >= 6;
}

export function validCedula(cedula: string): boolean {
  const cleaned = cedula.replace(/\D/g, '');
  return cleaned.length === 10;
}
