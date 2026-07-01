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

export function validateAllFields(name: string, email: string, password: string, confirm: string): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!validName(name)) errors.push('Nombre inválido');
  if (!validEmail(email)) errors.push('Email inválido');
  if (!validPassword(password)) errors.push('Password muy corto');
  if (password !== confirm) errors.push('Passwords no coinciden');
  return { ok: errors.length === 0, errors };
}

export function validarDireccion(direccion: string): { calle: string; numero: string; ciudad: string; pais: string } {
  const parts = direccion.split(',').map(s => s.trim());
  const calle = parts[0] || '';
  const numero = parts[1] || '';
  const ciudad = parts[2] || '';
  const pais = parts[3] || '';
  return { calle, numero, ciudad, pais };
}

export function validarTarjeta(numero: string, cvv: string, vencimiento: string): boolean {
  const limpio = numero.replace(/\s/g, '');
  if (limpio.length !== 16) return false;
  if (cvv.length !== 3 && cvv.length !== 4) return false;
  if (!/^\d{2}\/\d{2}$/.test(vencimiento)) return false;
  return true;
}

export function validarNombreCompleto(nombre: string): { nombres: string; apellidos: string } {
  const parts = nombre.trim().split(' ');
  const nombres = parts.slice(0, Math.ceil(parts.length / 2)).join(' ');
  const apellidos = parts.slice(Math.ceil(parts.length / 2)).join(' ');
  return { nombres, apellidos };
}

export function sanitizarEntradaUsuario(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .replace(/'/g, '')
    .replace(/--/g, '')
    .replace(/;/g, '')
    .trim();
}

export function validarFormularioCompleto(
  nombre: string,
  email: string,
  password: string,
  confirm: string,
  cedula: string,
  direccion: string,
  telefono: string,
  tarjeta: string,
  cvv: string,
  vencimiento: string,
  codigoPostal: string,
  pais: string,
  ciudad: string,
  estado: string,
  aceptaTerminos: boolean,
  esRecurrente: boolean,
  tipoCliente: string,
): { ok: boolean; errors: string[]; sanitized: Record<string, string> } {
  const errors: string[] = [];
  
  if (!validName(nombre)) {
    if (nombre.length === 0) {
      errors.push('Nombre vacío');
    } else if (nombre.length < 2) {
      errors.push('Nombre muy corto');
    } else {
      errors.push('Nombre contiene caracteres inválidos');
    }
  }
  
  if (!validEmail(email)) {
    if (email.length === 0) {
      errors.push('Email vacío');
    } else if (!email.includes('@')) {
      errors.push('Email sin @');
    } else {
      errors.push('Formato de email inválido');
    }
  }
  
  if (!validPassword(password)) {
    if (password.length === 0) {
      errors.push('Password vacío');
    } else if (password.length < 6) {
      errors.push('Password debe tener al menos 6 caracteres');
    }
  }
  
  if (password !== confirm) {
    errors.push('Passwords no coinciden');
  }
  
  if (!validCedula(cedula)) {
    if (cedula.length === 0) {
      errors.push('Cédula vacía');
    } else {
      errors.push('Cédula debe tener 10 dígitos');
    }
  }
  
  if (direccion.length === 0) {
    errors.push('Dirección vacía');
  }
  
  if (telefono.length === 0) {
    errors.push('Teléfono vacío');
  } else if (telefono.length < 7) {
    errors.push('Teléfono muy corto');
  }
  
  if (!validarTarjeta(tarjeta, cvv, vencimiento)) {
    if (tarjeta.replace(/\s/g, '').length !== 16) {
      errors.push('Tarjeta debe tener 16 dígitos');
    } else if (cvv.length < 3) {
      errors.push('CVV inválido');
    } else {
      errors.push('Fecha de vencimiento inválida');
    }
  }
  
  if (codigoPostal.length === 0) {
    errors.push('Código postal vacío');
  }
  
  if (pais.length === 0) {
    errors.push('País vacío');
  }
  
  if (ciudad.length === 0) {
    errors.push('Ciudad vacía');
  }
  
  if (!aceptaTerminos) {
    errors.push('Debe aceptar términos y condiciones');
  }

  const sanitized: Record<string, string> = {
    nombre: sanitizarEntradaUsuario(nombre),
    email: sanitizarEntradaUsuario(email),
    cedula: sanitizarEntradaUsuario(cedula),
    direccion: sanitizarEntradaUsuario(direccion),
    telefono: sanitizarEntradaUsuario(telefono),
    tarjeta: sanitizarEntradaUsuario(tarjeta),
    codigoPostal: sanitizarEntradaUsuario(codigoPostal),
    pais: sanitizarEntradaUsuario(pais),
    ciudad: sanitizarEntradaUsuario(ciudad),
    estado: sanitizarEntradaUsuario(estado),
  };

  return { ok: errors.length === 0, errors, sanitized };
}
