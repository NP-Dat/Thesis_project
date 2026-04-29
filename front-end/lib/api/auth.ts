// ============================================================
// TODO: Replace mock data below with real API calls to:
//   POST /api/auth/login
//   POST /api/auth/register
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: "employee" | "admin";
  gender: string;
  age: number;
}

const MOCK_USERS: User[] = [
  {
    id: "emp-001",
    email: "employee@test.com",
    name: "Nguyen Van A",
    role: "employee",
    gender: "Male",
    age: 32,
  },
  {
    id: "admin-001",
    email: "admin@test.com",
    name: "Tran Thi B",
    role: "admin",
    gender: "Female",
    age: 40,
  },
];

const MOCK_PASSWORD = "password";

export async function login(
  email: string,
  password: string
): Promise<User> {
  // TODO: Replace with fetch("POST /api/auth/login", { email, password })
  await new Promise((r) => setTimeout(r, 400));

  if (password !== MOCK_PASSWORD) {
    throw new Error("Invalid email or password");
  }

  const user = MOCK_USERS.find((u) => u.email === email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  return user;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  gender: string;
  age: number;
}

export async function register(data: RegisterData): Promise<User> {
  // TODO: Replace with fetch("POST /api/auth/register", data)
  await new Promise((r) => setTimeout(r, 400));

  const newUser: User = {
    id: `emp-${Date.now()}`,
    email: data.email,
    name: data.name,
    role: "employee",
    gender: data.gender,
    age: data.age,
  };

  return newUser;
}
