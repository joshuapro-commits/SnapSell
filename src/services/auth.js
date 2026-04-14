import { storageService } from './storage';

export const authService = {
  async login(email, password) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = await storageService.findUserByEmail(email);

      if (user && user.password === password) {
        const { password: _, ...userWithoutPassword } = user;
        await storageService.saveUser(userWithoutPassword);
        return { success: true, user: userWithoutPassword };
      }

      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  },

  async signup(email, password, name) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const existingUser = await storageService.findUserByEmail(email);
      if (existingUser) {
        return { success: false, error: 'Email already exists' };
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        name,
        password,
        avatar: '👤',
        createdAt: new Date().toISOString(),
      };

      await storageService.addUser(newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      await storageService.saveUser(userWithoutPassword);
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  },

  async logout() {
    try {
      await storageService.removeUser();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  },

  async getCurrentUser() {
    try {
      return await storageService.getUser();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
};
