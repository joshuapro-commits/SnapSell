import { storageService } from './storage';

const MOCK_USERS = [
  {
    id: '1',
    email: 'demo@snapsell.com',
    password: 'demo123',
    name: 'Joshua Sezi',
    avatar: '👤',
  },
  {
    id: '2',
    email: 'john@example.com',
    password: 'john123',
    name: 'John Doe',
    avatar: '👨',
  },
];

export const authService = {
  async login(email, password) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      await storageService.saveUser(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: 'Invalid email or password' };
  },

  async signup(email, password, name) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const existingUser = MOCK_USERS.find((u) => u.email === email);
    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      avatar: '👤',
    };

    MOCK_USERS.push({ ...newUser, password });
    await storageService.saveUser(newUser);
    return { success: true, user: newUser };
  },

  async logout() {
    await storageService.removeUser();
    return { success: true };
  },

  async getCurrentUser() {
    return await storageService.getUser();
  },
};
