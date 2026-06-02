const { getDemoUser, getUserRole } = require('../auth');

describe('auth demo accounts', () => {
  test('returns the expected test credentials for each profile', () => {
    expect(getDemoUser('funcionario@teste.com', 'Funcionario@123')).toEqual(expect.objectContaining({
      email: 'funcionario@teste.com',
      role: 'funcionario',
    }));

    expect(getDemoUser('paciente@teste.com', 'Paciente@123')).toEqual(expect.objectContaining({
      email: 'paciente@teste.com',
      role: 'patient',
    }));

    expect(getDemoUser('cuidador@teste.com', 'Cuidador@123')).toEqual(expect.objectContaining({
      email: 'cuidador@teste.com',
      role: 'caregiver',
    }));

    expect(getDemoUser('familiar@teste.com', 'Familiar@123')).toEqual(expect.objectContaining({
      email: 'familiar@teste.com',
      role: 'family',
    }));
  });

  test('detects the user role from the email', () => {
    expect(getUserRole('funcionario@teste.com')).toBe('funcionario');
    expect(getUserRole('paciente@teste.com')).toBe('patient');
    expect(getUserRole('cuidador@teste.com')).toBe('caregiver');
    expect(getUserRole('familiar@teste.com')).toBe('family');
  });
});
