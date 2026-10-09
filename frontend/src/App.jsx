
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

// Local development:
// http://localhost:5000/api
//
// For Render deployment, create frontend/.env.production with:
// VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com/api

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [activePage, setActivePage] = useState("Dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
 const [showLoginPassword, setShowLoginPassword] = useState(false);
const [showRegisterPassword, setShowRegisterPassword] = useState(false);
const [showResetPassword, setShowResetPassword] = useState(false);
  const [authPage, setAuthPage] = useState("login");

const [registerName, setRegisterName] = useState("");
const [registerEmail, setRegisterEmail] = useState("");
const [registerPassword, setRegisterPassword] = useState("");
const [registerError, setRegisterError] = useState("");

const [forgotEmail, setForgotEmail] = useState("");
const [newPassword, setNewPassword] = useState("");
const [forgotError, setForgotError] = useState("");

  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [users, setUsers] = useState([]);
 

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingSalary, setEditingSalary] = useState(null);
  const [editingDeduction, setEditingDeduction] = useState(null);

  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    salary: ""
  });

  const [salaryForm, setSalaryForm] = useState({
    employee: "",
    basicSalary: "",
    allowances: "",
    effectiveDate: ""
  });

  const [deductionForm, setDeductionForm] = useState({
    employee: "",
    type: "",
    amount: "",
    description: ""
  });

  const getCurrentPayPeriod = () =>
    new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const [editingPayroll, setEditingPayroll] = useState(null);
  const [payrollForm, setPayrollForm] = useState({
    employeeId: "",
    payPeriod: getCurrentPayPeriod(),
    basicSalary: "",
    allowances: "",
    totalDeductions: ""
  });

  const fetchUsers = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/users`,
      getAuthConfig()
    );

    console.log("Users response:", response.data);

    const userList =
      response.data?.data ||
      response.data?.users ||
      [];

    setUsers(userList);

  } catch (error) {
    console.error(
      "Users error:",
      error.response?.data || error.message
    );

    setUsers([]);
  }
};


const changeUserRole = async (userId, role) => {
  const confirmed = window.confirm(
    `Are you sure you want to make this user ${role}?`
  );

  if (!confirmed) return;

  try {
    await axios.put(
      `${API_URL}/admin/users/${userId}/role`,
      { role },
      getAuthConfig()
    );

    await fetchUsers();

    alert(`User is now ${role}`);

  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Unable to update user role"
    );
  }
};

  // Always get the latest token from localStorage.
  const getToken = () => localStorage.getItem("token");

  const getCurrentUser = () => {
    try {
        return JSON.parse(
            localStorage.getItem("user")
        );
    } catch {
        return null;
    }
};

const [currentUser, setCurrentUser] = useState(
  getCurrentUser()
);

const isAdmin = currentUser?.role === "admin";
  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const formatMoney = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  // =========================
  // LOGIN
  // =========================


  const login = async (e) => {
    e.preventDefault();

    setLoginError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email: email.trim(),
          password
        }
      );

      // Your backend returns data.token and data.user.
      const responseData = response.data?.data;
      const token = responseData?.token;
      const loggedInUser = responseData?.user;

      if (!token) {
        console.error("Login response:", response.data);
        throw new Error(
          "The server response did not contain a login token."
        );
      }

      // Save the token and user before opening the dashboard.
      localStorage.setItem("token", token);

      if (loggedInUser) {
        localStorage.setItem(
          "user",
          JSON.stringify(loggedInUser)
        );
      }

      setLoggedIn(true);
      setActivePage("Dashboard");
      setPassword("");

    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data || error.message
      );

      setLoginError(
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setCurrentUser(null);
    setLoggedIn(false);
    setActivePage("Dashboard");
};

     // =========================
  // REGISTER
  // =========================

  const registerUser = async (e) => {
    e.preventDefault();

    setRegisterError("");
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/auth/register`,
        {
          name: registerName,
          email: registerEmail,
          password: registerPassword
        }
      );

      alert("Account created successfully. You can now login.");

      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");

      setEmail(registerEmail);
      setPassword("");
      setAuthPage("login");

    } catch (error) {
      setRegisterError(
        error.response?.data?.message ||
        "Unable to create account"
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================
  // FORGOT PASSWORD
  // =========================

  const resetPassword = async (e) => {
    e.preventDefault();

    setForgotError("");
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/auth/forgot-password`,
        {
          email: forgotEmail,
          newPassword: newPassword
        }
      );

      alert("Password reset successfully. You can now login.");

      setForgotEmail("");
      setNewPassword("");

      setEmail(forgotEmail);
      setPassword("");
      setAuthPage("login");

    } catch (error) {
      setForgotError(
        error.response?.data?.message ||
        "Unable to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EMPLOYEES
  // =========================

  const fetchEmployees = async () => {
    try {
      const endpoint = isAdmin
        ? `${API_URL}/employees`
        : `${API_URL}/employees/me`;

      const response = await axios.get(
        endpoint,
        getAuthConfig()
      );

      const data = response.data?.data;

      setEmployees(
        Array.isArray(data)
          ? data
          : data
            ? [data]
            : []
      );
    } catch (error) {
      console.error(
        "Employees error:",
        error.response?.data || error.message
      );
      setEmployees([]);
    }
  };

  const addEmployee = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_URL}/employees`,
        {
          name: employeeForm.name,
          email: employeeForm.email,
          department: employeeForm.department,
          position: employeeForm.position,
          salary: Number(employeeForm.salary)
        },
        getAuthConfig()
      );

      setEmployeeForm({
        name: "",
        email: "",
        department: "",
        position: "",
        salary: ""
      });

      await fetchEmployees();

      alert("Employee created successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to create employee"
      );
    }
  };

  const editEmployee = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `${API_URL}/employees/${editingEmployee}`,
        {
          name: employeeForm.name,
          email: employeeForm.email,
          department: employeeForm.department,
          position: employeeForm.position,
          salary: Number(employeeForm.salary)
        },
        getAuthConfig()
      );

      setEmployeeForm({
        name: "",
        email: "",
        department: "",
        position: "",
        salary: ""
      });

      setEditingEmployee(null);

      await fetchEmployees();

      alert("Employee updated successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to update employee"
      );
    }
  };

  const startEditEmployee = (employee) => {
    setEditingEmployee(employee._id);

    setEmployeeForm({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      salary: employee.salary
    });

    setActivePage("Employees");
  };

  const deleteEmployee = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/employees/${id}`,
        getAuthConfig()
      );

      await fetchEmployees();

      alert("Employee deleted successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to delete employee"
      );
    }
  };

  const cancelEmployeeEdit = () => {
    setEditingEmployee(null);

    setEmployeeForm({
      name: "",
      email: "",
      department: "",
      position: "",
      salary: ""
    });
  };

  // =========================
  // SALARY
  // =========================

  const fetchSalaries = async () => {
    try {
      const endpoint = isAdmin
        ? `${API_URL}/salaries`
        : `${API_URL}/salaries/me`;

      const response = await axios.get(
        endpoint,
        getAuthConfig()
      );

      const data = response.data?.data;

      setSalaries(
        Array.isArray(data)
          ? data
          : data
            ? [data]
            : []
      );
    } catch (error) {
      console.error(
        "Salary error:",
        error.response?.data || error.message
      );
      setSalaries([]);
    }
  };

  const addSalary = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_URL}/salaries`,
        {
          employee: salaryForm.employee,
          basicSalary: Number(salaryForm.basicSalary),
          allowances: Number(salaryForm.allowances || 0),
          effectiveDate: salaryForm.effectiveDate
        },
        getAuthConfig()
      );

      setSalaryForm({
        employee: "",
        basicSalary: "",
        allowances: "",
        effectiveDate: ""
      });

      await fetchSalaries();

      alert("Salary record created successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to create salary"
      );
    }
  };

  const editSalary = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `${API_URL}/salaries/${editingSalary}`,
        {
          employee: salaryForm.employee,
          basicSalary: Number(salaryForm.basicSalary),
          allowances: Number(salaryForm.allowances || 0),
          effectiveDate: salaryForm.effectiveDate
        },
        getAuthConfig()
      );

      setSalaryForm({
        employee: "",
        basicSalary: "",
        allowances: "",
        effectiveDate: ""
      });

      setEditingSalary(null);

      await fetchSalaries();

      alert("Salary updated successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to update salary"
      );
    }
  };

  const startEditSalary = (salary) => {
    setEditingSalary(salary._id);

    setSalaryForm({
      employee: salary.employee?._id || salary.employee || "",
      basicSalary: salary.basicSalary,
      allowances: salary.allowances || "",
      effectiveDate: salary.effectiveDate
        ? new Date(salary.effectiveDate)
            .toISOString()
            .split("T")[0]
        : ""
    });

    setActivePage("Salary");
  };

  const deleteSalary = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this salary record?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/salaries/${id}`,
        getAuthConfig()
      );

      await fetchSalaries();

      alert("Salary deleted successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to delete salary"
      );
    }
  };

  const cancelSalaryEdit = () => {
    setEditingSalary(null);

    setSalaryForm({
      employee: "",
      basicSalary: "",
      allowances: "",
      effectiveDate: ""
    });
  };

  // =========================
  // DEDUCTIONS
  // =========================

  const fetchDeductions = async () => {
    try {
      const endpoint = isAdmin
        ? `${API_URL}/deductions`
        : `${API_URL}/deductions/me`;

      const response = await axios.get(
        endpoint,
        getAuthConfig()
      );

      const data = response.data?.data;

      setDeductions(
        Array.isArray(data)
          ? data
          : data
            ? [data]
            : []
      );
    } catch (error) {
      console.error(
        "Deduction error:",
        error.response?.data || error.message
      );
      setDeductions([]);
    }
  };

  const addDeduction = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_URL}/deductions`,
        {
          employee: deductionForm.employee,
          type: deductionForm.type,
          amount: Number(deductionForm.amount),
          description: deductionForm.description
        },
        getAuthConfig()
      );

      setDeductionForm({
        employee: "",
        type: "",
        amount: "",
        description: ""
      });

      await fetchDeductions();

      alert("Deduction created successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to create deduction"
      );
    }
  };

  const editDeduction = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `${API_URL}/deductions/${editingDeduction}`,
        {
          employee: deductionForm.employee,
          type: deductionForm.type,
          amount: Number(deductionForm.amount),
          description: deductionForm.description
        },
        getAuthConfig()
      );

      setDeductionForm({
        employee: "",
        type: "",
        amount: "",
        description: ""
      });

      setEditingDeduction(null);

      await fetchDeductions();

      alert("Deduction updated successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to update deduction"
      );
    }
  };

  const startEditDeduction = (deduction) => {
    setEditingDeduction(deduction._id);

    setDeductionForm({
      employee: deduction.employee?._id || deduction.employee || "",
      type: deduction.type,
      amount: deduction.amount,
      description: deduction.description || ""
    });

    setActivePage("Deductions");
  };

  const deleteDeduction = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deduction?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/deductions/${id}`,
        getAuthConfig()
      );

      await fetchDeductions();

      alert("Deduction deleted successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to delete deduction"
      );
    }
  };

  const cancelDeductionEdit = () => {
    setEditingDeduction(null);

    setDeductionForm({
      employee: "",
      type: "",
      amount: "",
      description: ""
    });
  };

  // =========================
  // PAYROLL
  // =========================

  const fetchPayrolls = async () => {
    try {
      const endpoint = isAdmin
        ? `${API_URL}/payrolls`
        : `${API_URL}/payrolls/me`;

      const response = await axios.get(
        endpoint,
        getAuthConfig()
      );

      const data = response.data?.data;

      setPayrolls(
        Array.isArray(data)
          ? data
          : data
            ? [data]
            : []
      );
    } catch (error) {
      console.error(
        "Payroll error:",
        error.response?.data || error.message
      );
      setPayrolls([]);
    }
  };

  const isFuturePayPeriod = (period) => {
    const match = /^([A-Za-z]+)\s+(\d{4})$/.exec(String(period || "").trim());
    if (!match) return false;
    const parsed = new Date(`${match[1]} 1, ${match[2]} 00:00:00`);
    if (Number.isNaN(parsed.getTime())) return false;
    const today = new Date();
    return parsed.getFullYear() > today.getFullYear() ||
      (parsed.getFullYear() === today.getFullYear() && parsed.getMonth() > today.getMonth());
  };

  const runPayroll = async (e) => {
    e.preventDefault();
    if (isFuturePayPeriod(payrollForm.payPeriod)) {
      alert("Payroll cannot be processed for a future month.");
      return;
    }
    try {
      await axios.post(`${API_URL}/payrolls/run`, {
        employeeId: payrollForm.employeeId,
        payPeriod: payrollForm.payPeriod.trim()
      }, getAuthConfig());
      await fetchPayrolls();
      setPayrollForm({ employeeId: "", payPeriod: getCurrentPayPeriod(), basicSalary: "", allowances: "", totalDeductions: "" });
      alert("Payroll processed successfully");
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || "Unable to process payroll";
      alert("Payroll Error: " + message);
    }
  };

  const startEditPayroll = (payroll) => {
    setEditingPayroll(payroll._id);
    setPayrollForm({
      employeeId: payroll.employee?._id || payroll.employee || "",
      payPeriod: payroll.payPeriod || getCurrentPayPeriod(),
      basicSalary: payroll.basicSalary ?? 0,
      allowances: payroll.allowances ?? 0,
      totalDeductions: payroll.totalDeductions ?? 0
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editPayroll = async (e) => {
    e.preventDefault();
    if (isFuturePayPeriod(payrollForm.payPeriod)) {
      alert("Payroll cannot be changed to a future month.");
      return;
    }
    try {
      await axios.put(`${API_URL}/payrolls/${editingPayroll}`, {
        payPeriod: payrollForm.payPeriod.trim()
      }, getAuthConfig());
      await fetchPayrolls();
      setEditingPayroll(null);
      setPayrollForm({ employeeId: "", payPeriod: getCurrentPayPeriod(), basicSalary: "", allowances: "", totalDeductions: "" });
      alert("Payroll record updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update payroll. Confirm the backend PUT route is added.");
    }
  };
  
const deletePayroll = async (id) => {
    const confirmed = window.confirm(
        "Are you sure you want to permanently delete this payroll record? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
        await axios.delete(
            `${API_URL}/payrolls/${id}`,
            getAuthConfig()
        );

        if (editingPayroll === id) {
            cancelPayrollEdit();
        }

        await fetchPayrolls();

        alert("Payroll record deleted successfully");
    } catch (error) {
        alert(
            error.response?.data?.message ||
            "Unable to delete payroll record"
        );
    }
};

  const cancelPayrollEdit = () => {
    setEditingPayroll(null);
    setPayrollForm({ employeeId: "", payPeriod: getCurrentPayPeriod(), basicSalary: "", allowances: "", totalDeductions: "" });
  };
   
    // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
  if (loggedIn) {
    fetchEmployees();
    fetchSalaries();
    fetchDeductions();
    fetchPayrolls();

    if (isAdmin) {
      fetchUsers();
    }
  }
}, [loggedIn, isAdmin]);;

  // =========================
  // LOGIN SCREEN
  // =========================

    // =========================
  // AUTHENTICATION SCREENS
  // =========================

  if (!loggedIn) {

    // REGISTER SCREEN
    if (authPage === "register") {
      return (
        <div className="login-page">
          <div className="login-box">

            <div className="login-logo">
              SP
            </div>

            <h1>Create Account</h1>

            <p className="login-subtitle">
              Register for Simple Payroll
            </p>

            <form onSubmit={registerUser}>

              <label>Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={registerName}
                onChange={(e) =>
                  setRegisterName(e.target.value)
                }
                required
              />

              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={registerEmail}
                onChange={(e) =>
                  setRegisterEmail(e.target.value)
                }
                required
              />

              <label>Password</label>

              <div className="password-wrapper">

  <input
    type={showRegisterPassword ? "text" : "password"}
    placeholder="Create a password"
    value={registerPassword}
    onChange={(e) => setRegisterPassword(e.target.value)}
    required
  />

  <button
    type="button"
    className="password-toggle"
    onClick={() =>
      setShowRegisterPassword(!showRegisterPassword)
    }
    aria-label={
      showRegisterPassword
        ? "Hide password"
        : "Show password"
    }
  >
    {showRegisterPassword ? "🙈" : "👁️"}
  </button>

</div>
              <button
                className="primary-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>

              {registerError && (
                <div className="error-message">
                  {registerError}
                </div>
              )}

            </form>

            <button
              type="button"
              className="text-button"
              onClick={() => {
                setRegisterError("");
                setAuthPage("login");
              }}
            >
              Already have an account? Login
            </button>

          </div>
        </div>
      );
    }


    // FORGOT PASSWORD SCREEN
    if (authPage === "forgot") {
      return (
        <div className="login-page">
          <div className="login-box">

            <div className="login-logo">
              SP
            </div>

            <h1>Reset Password</h1>

            <p className="login-subtitle">
              Create a new password
            </p>

            <form onSubmit={resetPassword}>

              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) =>
                  setForgotEmail(e.target.value)
                }
                required
              />

             <label>New Password</label>

<div className="password-wrapper">

  <input
    type={showResetPassword ? "text" : "password"}
    placeholder="Create a new password"
    value={newPassword}
    onChange={(e) =>
      setNewPassword(e.target.value)
    }
    required
  />

  <button
    type="button"
    className="password-toggle"
    onClick={() =>
      setShowResetPassword(!showResetPassword)
    }
    aria-label={
      showResetPassword
        ? "Hide password"
        : "Show password"
    }
  >
    {showResetPassword ? "🙈" : "👁️"}
  </button>

</div>

              <button
                className="primary-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              {forgotError && (
                <div className="error-message">
                  {forgotError}
                </div>
              )}

            </form>

            <button
              type="button"
              className="text-button"
              onClick={() => {
                setForgotError("");
                setAuthPage("login");
              }}
            >
              Back to Login
            </button>

          </div>
        </div>
      );
    }


    // LOGIN SCREEN
    return (
      <div className="login-page">
        <div className="login-box">

          <div className="login-logo">
            SP
          </div>

          <h1>Simple Payroll</h1>

          <p className="login-subtitle">
            Sign in to your account
          </p>

          <form onSubmit={login}>

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

           <label>Password</label>

<div className="password-wrapper">

  <input
    type={showLoginPassword ? "text" : "password"}
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />

  <button
    type="button"
    className="password-toggle"
    onClick={() =>
      setShowLoginPassword(!showLoginPassword)
    }
    aria-label={
      showLoginPassword
        ? "Hide password"
        : "Show password"
    }
  >
    {showLoginPassword ? "🙈" : "👁️"}
  </button>

</div>

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}

          </form>

          <div className="auth-links">

            <button
              type="button"
              className="text-button"
              onClick={() => {
                setLoginError("");
                setAuthPage("register");
              }}
            >
              Create Account
            </button>

            <button
              type="button"
              className="text-button"
              onClick={() => {
                setLoginError("");
                setAuthPage("forgot");
              }}
            >
              Forgot Password?
            </button>

          </div>

        </div>
      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  const myEmployee = employees[0] || null;
  const mySalary = salaries[0] || null;

  return (
    <div className="app">

      <header className="topbar">

        <div>
          <h1>Simple Payroll App</h1>
          <p>Payroll Management System</p>
        </div>

        <button
          className="logout-button"
          type="button"
          onClick={logout}
        >
          Logout
        </button>

      </header>

      <div className="layout">

        <aside className="sidebar">

          <div className="sidebar-title">

            <div className="sidebar-logo">
              SP
            </div>

            <div>
              <strong>Payroll</strong>
              <small>Management</small>
            </div>

          </div>

          <nav>

            <button
              type="button"
              className={
                activePage === "Dashboard"
                  ? "nav-button active"
                  : "nav-button"
              }
              onClick={() => setActivePage("Dashboard")}
            >
              <span>▣</span>
              Dashboard
            </button>

            {isAdmin ? (
              <>
                <button
                  type="button"
                  className={
                    activePage === "Employees"
                      ? "nav-button active"
                      : "nav-button"
                  }
                  onClick={() => setActivePage("Employees")}
                >
                  <span>👥</span>
                  Employees
                </button>

                <button
                  type="button"
                  className={
                    activePage === "Salary"
                      ? "nav-button active"
                      : "nav-button"
                  }
                  onClick={() => setActivePage("Salary")}
                >
                  <span>₦</span>
                  Salary
                </button>

                <button
                  type="button"
                  className={
                    activePage === "Deductions"
                      ? "nav-button active"
                      : "nav-button"
                  }
                  onClick={() => setActivePage("Deductions")}
                >
                  <span>−</span>
                  Deductions
                </button>

                <button
                  type="button"
                  className={
                    activePage === "Payroll"
                      ? "nav-button active"
                      : "nav-button"
                  }
                  onClick={() => setActivePage("Payroll")}
                >
                  <span>▤</span>
                  Payroll
                </button>

                <button
                  type="button"
                  className={
                    activePage === "Users"
                      ? "nav-button active"
                      : "nav-button"
                  }
                  onClick={() => {
                    setActivePage("Users");
                    fetchUsers();
                  }}
                >
                  <span>👤</span>
                  Users
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={
                    activePage === "Profile"
                      ? "nav-button active"
                      : "nav-button"
                  }
                  onClick={() => setActivePage("Profile")}
                >
                  <span>👤</span>
                  My Profile
                </button>

                <button
                  type="button"
                  className={
                    activePage === "Salary"
                      ? "nav-button active"
                      : "nav-button"
                  }
                  onClick={() => setActivePage("Salary")}
                >
                  <span>₦</span>
                  My Salary
                </button>

                <button
                  type="button"
                  className={
                    activePage === "Deductions"
                      ? "nav-button active"
                      : "nav-button"
                  }
                  onClick={() => setActivePage("Deductions")}
                >
                  <span>−</span>
                  My Deductions
                </button>

                <button
                  type="button"
                  className={
                    activePage === "Payroll"
                      ? "nav-button active"
                      : "nav-button"
                  }
                  onClick={() => setActivePage("Payroll")}
                >
                  <span>▤</span>
                  My Payroll
                </button>
              </>
            )}

          </nav>

          <div className="sidebar-footer">
            <small>Simple Payroll App</small>
            <small>{isAdmin ? "Admin Panel" : "Employee Portal"}</small>
          </div>

        </aside>

        <main className="content">

          {/* DASHBOARD */}

          {activePage === "Dashboard" && (
            <>
              {isAdmin ? (
                <>
            <>
              <div className="page-header">

                <div>
                  <h2>Dashboard</h2>
                  <p>
                    Welcome to Simple Payroll
                  </p>
                </div>

              </div>

              <div className="stats-grid">

                <div className="stat-card">

                  <div className="stat-icon">
                    👥
                  </div>

                  <div>
                    <span>Employees</span>
                    <strong>
                      {employees.length}
                    </strong>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon">
                    ₦
                  </div>

                  <div>
                    <span>Salary Records</span>
                    <strong>
                      {salaries.length}
                    </strong>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon">
                    −
                  </div>

                  <div>
                    <span>Deductions</span>
                    <strong>
                      {deductions.length}
                    </strong>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon">
                    ▤
                  </div>

                  <div>
                    <span>Payroll Runs</span>
                    <strong>
                      {payrolls.length}
                    </strong>
                  </div>

                </div>

              </div>

              <div className="welcome-card">

                <div>
                  <h3>
                    Payroll Management
                  </h3>

                  <p>
                    Manage employees, salaries,
                    deductions and payroll from one place.
                  </p>
                </div>

                <button
                  type="button"
                  className="primary-button small"
                  onClick={() =>
                    setActivePage("Employees")
                  }
                >
                  Manage Employees
                </button>

              </div>
            </>
                </>
              ) : (
                <>
              <div className="page-header">
                <div>
                  <h2>My Payroll Dashboard</h2>
                  <p>
                    Welcome, {currentUser?.name || myEmployee?.name || "Employee"}
                  </p>
                </div>
              </div>

              <div className="stats-grid">

                <div className="stat-card">
                  <div className="stat-icon">👤</div>
                  <div>
                    <span>My Profile</span>
                    <strong>{myEmployee ? "Ready" : "—"}</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">₦</div>
                  <div>
                    <span>My Salary</span>
                    <strong>{salaries.length}</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">−</div>
                  <div>
                    <span>My Deductions</span>
                    <strong>{deductions.length}</strong>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">▤</div>
                  <div>
                    <span>My Payroll</span>
                    <strong>{payrolls.length}</strong>
                  </div>
                </div>

              </div>

              <div className="welcome-card">
                <div>
                  <h3>My Payroll Information</h3>
                  <p>
                    View your employee details, salary, deductions and payroll records.
                  </p>
                </div>

                <button
                  type="button"
                  className="primary-button small"
                  onClick={() => setActivePage("Profile")}
                >
                  View My Profile
                </button>
              </div>
                </>
              )}
            </>
          )}

          {/* EMPLOYEE PROFILE */}

          {!isAdmin && activePage === "Profile" && (
            <>
              <div className="page-header">
                <div>
                  <h2>My Profile</h2>
                  <p>View your employee information.</p>
                </div>
              </div>

              <div className="form-card employee-profile-card">
                <h3>Employee Details</h3>

                {myEmployee ? (
                  <div className="form-grid employee-profile-grid">
                    <div className="profile-detail">
                      <label>Name</label>
                      <p>{myEmployee.name || "—"}</p>
                    </div>

                    <div className="profile-detail">
                      <label>Email</label>
                      <p>{myEmployee.email || currentUser?.email || "—"}</p>
                    </div>

                    <div className="profile-detail">
                      <label>Department</label>
                      <p>{myEmployee.department || "—"}</p>
                    </div>

                    <div className="profile-detail">
                      <label>Position</label>
                      <p>{myEmployee.position || "—"}</p>
                    </div>

                    <div className="profile-detail">
                      <label>Salary</label>
                      <p>{formatMoney(myEmployee.salary)}</p>
                    </div>

                    <div className="profile-detail">
                      <label>Status</label>
                      <p>{myEmployee.status || "—"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="empty">
                    Your employee record has not been added yet.
                  </p>
                )}
              </div>
            </>
          )}

          {/* EMPLOYEES */}

          {isAdmin && activePage === "Employees" && (
            <>

              <div className="page-header">

                <div>
                  <h2>Employees</h2>

                  <p>
                    Add and manage your employees.
                  </p>
                </div>

              </div>

              <div className="form-card">

                <h3>
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h3>

                <form
                  className="form-grid"
                  onSubmit={
                    editingEmployee
                      ? editEmployee
                      : addEmployee
                  }
                >

                  <div>

                    <label>Name</label>

                    <input
                      type="text"
                      placeholder="Employee name"
                      value={employeeForm.name}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          name: e.target.value
                        })
                      }
                      required
                    />

                  </div>

                  <div>

                    <label>Email</label>

                    <input
                      type="email"
                      placeholder="Employee email"
                      value={employeeForm.email}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          email: e.target.value
                        })
                      }
                      required
                    />

                  </div>

                  <div>

                    <label>Department</label>

                    <input
                      type="text"
                      placeholder="e.g. Finance"
                      value={employeeForm.department}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          department: e.target.value
                        })
                      }
                      required
                    />

                  </div>

                  <div>

                    <label>Position</label>

                    <input
                      type="text"
                      placeholder="e.g. Accountant"
                      value={employeeForm.position}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          position: e.target.value
                        })
                      }
                      required
                    />

                  </div>

                  <div>

                    <label>Salary</label>

                    <input
                      type="number"
                      placeholder="e.g. 250000"
                      value={employeeForm.salary}
                      onChange={(e) =>
                        setEmployeeForm({
                          ...employeeForm,
                          salary: e.target.value
                        })
                      }
                      required
                    />

                  </div>

                  <div className="form-action">

                    <button
                      className="primary-button"
                      type="submit"
                    >
                      {editingEmployee
                        ? "Update Employee"
                        : "Add Employee"}
                    </button>

                    {editingEmployee && (
                      <button
                        className="cancel-button"
                        type="button"
                        onClick={cancelEmployeeEdit}
                      >
                        Cancel
                      </button>
                    )}

                  </div>

                </form>

              </div>

              <div className="table-card">

                <div className="table-header">

                  <h3>
                    Employee List
                  </h3>

                  <span>
                    {employees.length} employees
                  </span>

                </div>

                {employees.length === 0 ? (
                  <p className="empty">
                    No employees found.
                  </p>
                ) : (
                  <div className="table-container">

                    <table>

                      <thead>

                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Department</th>
                          <th>Position</th>
                          <th>Salary</th>
                          <th>Actions</th>
                        </tr>

                      </thead>

                      <tbody>

                        {employees.map((employee) => (
                          <tr key={employee._id}>

                            <td>
                              <strong>
                                {employee.name}
                              </strong>
                            </td>

                            <td>
                              {employee.email}
                            </td>

                            <td>
                              <span className="badge">
                                {employee.department}
                              </span>
                            </td>

                            <td>
                              {employee.position}
                            </td>

                            <td>
                              {formatMoney(
                                employee.salary
                              )}
                            </td>

                            <td>

                              <div className="action-buttons">

                                <button
                                  className="edit-button"
                                  type="button"
                                  onClick={() =>
                                    startEditEmployee(employee)
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  className="delete-button"
                                  type="button"
                                  onClick={() =>
                                    deleteEmployee(
                                      employee._id
                                    )
                                  }
                                >
                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>

            </>
          )}

          {/* EMPLOYEE SALARY */}

          {!isAdmin && activePage === "Salary" && (
            <>
              <div className="page-header">
                <div>
                  <h2>My Salary</h2>
                  <p>View your salary records.</p>
                </div>
              </div>

              <div className="table-card">
                <div className="table-header">
                  <h3>My Salary Records</h3>
                  <span>{salaries.length} record{salaries.length === 1 ? "" : "s"}</span>
                </div>

                {salaries.length === 0 ? (
                  <p className="empty">No salary record found.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Basic Salary</th>
                          <th>Allowances</th>
                          <th>Effective Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaries.map((salary) => (
                          <tr key={salary._id}>
                            <td>{formatMoney(salary.basicSalary)}</td>
                            <td>{formatMoney(salary.allowances)}</td>
                            <td>
                              {salary.effectiveDate
                                ? new Date(salary.effectiveDate).toLocaleDateString()
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* SALARY */}

          {isAdmin && activePage === "Salary" && (
            <>

              <div className="page-header">

                <div>
                  <h2>Salary</h2>

                  <p>
                    Manage employee salary records.
                  </p>
                </div>

              </div>

              <div className="form-card">

                <h3>
                  {editingSalary
                    ? "Edit Salary Record"
                    : "Add Salary Record"}
                </h3>

                <form
                  className="form-grid"
                  onSubmit={
                    editingSalary
                      ? editSalary
                      : addSalary
                  }
                >

                  <div>

                    <label>Employee</label>

                    <select
                      value={salaryForm.employee}
                      onChange={(e) =>
                        setSalaryForm({
                          ...salaryForm,
                          employee: e.target.value
                        })
                      }
                      required
                    >

                      <option value="">
                        Select employee
                      </option>

                      {employees.map((employee) => (
                        <option
                          key={employee._id}
                          value={employee._id}
                        >
                          {employee.name}
                        </option>
                      ))}

                    </select>

                  </div>

                  <div>

                    <label>Basic Salary</label>

                    <input
                      type="number"
                      placeholder="250000"
                      value={salaryForm.basicSalary}
                      onChange={(e) =>
                        setSalaryForm({
                          ...salaryForm,
                          basicSalary: e.target.value
                        })
                      }
                      required
                    />

                  </div>

                  <div>

                    <label>Allowances</label>

                    <input
                      type="number"
                      placeholder="50000"
                      value={salaryForm.allowances}
                      onChange={(e) =>
                        setSalaryForm({
                          ...salaryForm,
                          allowances: e.target.value
                        })
                      }
                    />

                  </div>

                  <div>

                    <label>Effective Date</label>

                    <input
                      type="date"
                      value={salaryForm.effectiveDate}
                      onChange={(e) =>
                        setSalaryForm({
                          ...salaryForm,
                          effectiveDate: e.target.value
                        })
                      }
                      required
                    />

                  </div>

                  <div className="form-action">

                    <button
                      className="primary-button"
                      type="submit"
                    >
                      {editingSalary
                        ? "Update Salary"
                        : "Add Salary"}
                    </button>

                    {editingSalary && (
                      <button
                        className="cancel-button"
                        type="button"
                        onClick={cancelSalaryEdit}
                      >
                        Cancel
                      </button>
                    )}

                  </div>

                </form>

              </div>

              <div className="table-card">

                <div className="table-header">

                  <h3>
                    Salary Records
                  </h3>

                  <span>
                    {salaries.length} records
                  </span>

                </div>

                {salaries.length === 0 ? (
                  <p className="empty">
                    No salary records found.
                  </p>
                ) : (
                  <div className="table-container">

                    <table>

                      <thead>

                        <tr>
                          <th>Employee</th>
                          <th>Basic Salary</th>
                          <th>Allowances</th>
                          <th>Effective Date</th>
                          <th>Actions</th>
                        </tr>

                      </thead>

                      <tbody>

                        {salaries.map((salary) => (
                          <tr key={salary._id}>

                            <td>
                              <strong>
                                {salary.employee?.name ||
                                  "Employee"}
                              </strong>
                            </td>

                            <td>
                              {formatMoney(
                                salary.basicSalary
                              )}
                            </td>

                            <td>
                              {formatMoney(
                                salary.allowances
                              )}
                            </td>

                            <td>
                              {new Date(
                                salary.effectiveDate
                              ).toLocaleDateString()}
                            </td>

                            <td>

                              <div className="action-buttons">

                                <button
                                  className="edit-button"
                                  type="button"
                                  onClick={() =>
                                    startEditSalary(salary)
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  className="delete-button"
                                  type="button"
                                  onClick={() =>
                                    deleteSalary(
                                      salary._id
                                    )
                                  }
                                >
                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>

            </>
          )}

          {/* EMPLOYEE DEDUCTIONS */}

          {!isAdmin && activePage === "Deductions" && (
            <>
              <div className="page-header">
                <div>
                  <h2>My Deductions</h2>
                  <p>View deductions applied to your payroll.</p>
                </div>
              </div>

              <div className="table-card">
                <div className="table-header">
                  <h3>My Deduction Records</h3>
                  <span>{deductions.length} record{deductions.length === 1 ? "" : "s"}</span>
                </div>

                {deductions.length === 0 ? (
                  <p className="empty">No deduction record found.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deductions.map((deduction) => (
                          <tr key={deduction._id}>
                            <td>{deduction.type || "—"}</td>
                            <td>{formatMoney(deduction.amount)}</td>
                            <td>{deduction.description || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* DEDUCTIONS */}

          {isAdmin && activePage === "Deductions" && (
            <>

              <div className="page-header">

                <div>
                  <h2>Deductions</h2>

                  <p>
                    Manage employee deductions.
                  </p>
                </div>

              </div>

              <div className="form-card">

                <h3>
                  {editingDeduction
                    ? "Edit Deduction"
                    : "Add Deduction"}
                </h3>

                <form
                  className="form-grid"
                  onSubmit={
                    editingDeduction
                      ? editDeduction
                      : addDeduction
                  }
                >

                  <div>

                    <label>Employee</label>

                    <select
                      value={deductionForm.employee}
                      onChange={(e) =>
                        setDeductionForm({
                          ...deductionForm,
                          employee: e.target.value
                        })
                      }
                      required
                    >

                      <option value="">
                        Select employee
                      </option>

                      {employees.map((employee) => (
                        <option
                          key={employee._id}
                          value={employee._id}
                        >
                          {employee.name}
                        </option>
                      ))}

                    </select>

                  </div>

                  <div>

                    <label>Deduction Type</label>

                    <input
                      type="text"
                      placeholder="e.g. Tax"
                      value={deductionForm.type}
                      onChange={(e) =>
                        setDeductionForm({
                          ...deductionForm,
                          type: e.target.value
                        })
                      }
                      required
                    />

                  </div>

                  <div>

                    <label>Amount</label>

                    <input
                      type="number"
                      placeholder="20000"
                      value={deductionForm.amount}
                      onChange={(e) =>
                        setDeductionForm({
                          ...deductionForm,
                          amount: e.target.value
                        })
                      }
                      required
                    />

                  </div>

                  <div>

                    <label>Description</label>

                    <input
                      type="text"
                      placeholder="Monthly tax"
                      value={deductionForm.description}
                      onChange={(e) =>
                        setDeductionForm({
                          ...deductionForm,
                          description: e.target.value
                        })
                      }
                    />

                  </div>

                  <div className="form-action">

                    <button
                      className="primary-button"
                      type="submit"
                    >
                      {editingDeduction
                        ? "Update Deduction"
                        : "Add Deduction"}
                    </button>

                    {editingDeduction && (
                      <button
                        className="cancel-button"
                        type="button"
                        onClick={cancelDeductionEdit}
                      >
                        Cancel
                      </button>
                    )}

                  </div>

                </form>

              </div>

              <div className="table-card">

                <div className="table-header">

                  <h3>
                    Deduction Records
                  </h3>

                  <span>
                    {deductions.length} records
                  </span>

                </div>

                {deductions.length === 0 ? (
                  <p className="empty">
                    No deductions found.
                  </p>
                ) : (
                  <div className="table-container">

                    <table>

                      <thead>

                        <tr>
                          <th>Employee</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>

                      </thead>

                      <tbody>

                        {deductions.map((deduction) => (
                          <tr key={deduction._id}>

                            <td>
                              <strong>
                                {deduction.employee?.name ||
                                  "Employee"}
                              </strong>
                            </td>

                            <td>
                              <span className="badge warning">
                                {deduction.type}
                              </span>
                            </td>

                            <td>
                              {formatMoney(
                                deduction.amount
                              )}
                            </td>

                            <td>
                              {deduction.description || "-"}
                            </td>

                            <td>

                              <div className="action-buttons">

                                <button
                                  className="edit-button"
                                  type="button"
                                  onClick={() =>
                                    startEditDeduction(
                                      deduction
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  className="delete-button"
                                  type="button"
                                  onClick={() =>
                                    deleteDeduction(
                                      deduction._id
                                    )
                                  }
                                >
                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>

            </>
          )}

          {/* EMPLOYEE PAYROLL */}

          {!isAdmin && activePage === "Payroll" && (
            <>
              <div className="page-header">
                <div>
                  <h2>My Payroll</h2>
                  <p>View your processed payroll records.</p>
                </div>
              </div>

              <div className="table-card">
                <div className="table-header">
                  <h3>My Payroll Records</h3>
                  <span>{payrolls.length} record{payrolls.length === 1 ? "" : "s"}</span>
                </div>

                {payrolls.length === 0 ? (
                  <p className="empty">No payroll record found.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Pay Period</th>
                          <th>Gross Salary</th>
                          <th>Deductions</th>
                          <th>Net Salary</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrolls.map((payroll) => (
                          <tr key={payroll._id}>
                            <td>{payroll.payPeriod || "—"}</td>
                            <td>{formatMoney(payroll.grossSalary)}</td>
                            <td>{formatMoney(payroll.totalDeductions)}</td>
                            <td>{formatMoney(payroll.netSalary)}</td>
                            <td>{payroll.status || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* PAYROLL */}

          {isAdmin && activePage === "Payroll" && (
            <>

              <div className="page-header">

                <div>
                  <h2>Payroll</h2>

                  <p>
                    Process employee payroll.
                  </p>
                </div>

              </div>

              <div className="form-card">

                <h3>{editingPayroll ? "Edit Payroll Record" : "Process Payroll"}</h3>

                <form
                  className="form-grid"
                  onSubmit={editingPayroll ? editPayroll : runPayroll}
                >

                  <div>

                    <label>Employee</label>

                    <select
                      value={payrollForm.employeeId}
                      onChange={(e) => setPayrollForm({ ...payrollForm, employeeId: e.target.value })}
                      required
                      disabled={Boolean(editingPayroll)}
                    >

                      <option value="">
                        Select employee
                      </option>

                      {employees.map((employee) => (
                        <option
                          key={employee._id}
                          value={employee._id}
                        >
                          {employee.name}
                        </option>
                      ))}

                    </select>

                  </div>

                  <div>

                    <label>Pay Period</label>

                    <input
                      type="text"
                      placeholder="October 2026"
                      value={payrollForm.payPeriod}
                      onChange={(e) => setPayrollForm({ ...payrollForm, payPeriod: e.target.value })}
                      required
                    />
                    <small className="field-help">Use Month Year format. Future months are not allowed.</small>

                  </div>

                  {editingPayroll && (
                    <>
                      <div>
                        <label>Basic Salary</label>
                        <input type="number" min="0" value={payrollForm.basicSalary} onChange={(e) => setPayrollForm({ ...payrollForm, basicSalary: e.target.value })} required />
                      </div>
                      <div>
                        <label>Allowances</label>
                        <input type="number" min="0" value={payrollForm.allowances} onChange={(e) => setPayrollForm({ ...payrollForm, allowances: e.target.value })} required />
                      </div>
                      <div>
                        <label>Total Deductions</label>
                        <input type="number" min="0" value={payrollForm.totalDeductions} onChange={(e) => setPayrollForm({ ...payrollForm, totalDeductions: e.target.value })} required />
                      </div>
                    </>
                  )}

                  <div className="form-action">

                    <button className="primary-button" type="submit">
                      {editingPayroll ? "Update Payroll" : "Process Payroll"}
                    </button>
                    {editingPayroll && <button className="cancel-button" type="button" onClick={cancelPayrollEdit}>Cancel</button>}

                  </div>

                </form>

              </div>

              <div className="table-card">

                <div className="table-header">

                  <h3>
                    Payroll History
                  </h3>

                  <span>
                    {payrolls.length} records
                  </span>

                </div>

                {payrolls.length === 0 ? (
                  <p className="empty">
                    No payroll records found.
                  </p>
                ) : (
                  <div className="table-container">

                    <table>

                      <thead>

                        <tr>
                          <th>Employee</th>
                          <th>Gross Salary</th>
                          <th>Deductions</th>
                          <th>Net Salary</th>
                          <th>Period</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>

                      </thead>

                      <tbody>

                        {payrolls.map((payroll) => (
                          <tr key={payroll._id}>

                            <td>
                              <strong>
                                {payroll.employee?.name ||
                                  "Employee"}
                              </strong>
                            </td>

                            <td>
                              {formatMoney(
                                payroll.grossSalary
                              )}
                            </td>

                            <td>
                              {formatMoney(
                                payroll.totalDeductions
                              )}
                            </td>

                            <td className="net-salary">
                              {formatMoney(
                                payroll.netSalary
                              )}
                            </td>

                            <td>
                              {payroll.payPeriod}
                            </td>

                            <td><span className="status">{payroll.status}</span></td>
                            <td><div className="action-buttons"><button className="edit-button" type="button" onClick={() => startEditPayroll(payroll)}>Edit</button>
                            <button className="delete-button" type="button" onClick={() => deletePayroll(payroll._id)}>
                                Delete
                              </button>
                            </div></td>
                             
                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>

            </>
          )}
                   {/* USERS */}

{activePage === "Users" && isAdmin && (
  <>

    <div className="page-header">

      <div>
        <h2>User Management</h2>

        <p>
          Manage application users and access roles.
        </p>
      </div>

    </div>

    <div className="table-card">

      <div className="table-header">

        <h3>
          System Users
        </h3>

        <span>
          {users.length} users
        </span>

      </div>

      {users.length === 0 ? (
        <p className="empty">
          No users found.
        </p>
      ) : (
        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {users.map((user) => (

                <tr key={user._id}>

                  <td>
                    <strong>
                      {user.name}
                    </strong>
                  </td>

                  <td>
                    {user.email}
                  </td>

                  <td>
                    <span
                      className={
                        user.role === "admin"
                          ? "role-badge admin"
                          : "role-badge employee"
                      }
                    >
                      {user.role}
                    </span>
                  </td>

                  <td>

                    {user._id === (currentUser?._id || currentUser?.id) ? (

                      <span className="current-user">
                        Current account
                      </span>

                    ) : user.role === "admin" ? (

                      <button
                        type="button"
                        className="role-button employee-role"
                        onClick={() =>
                          changeUserRole(
                            user._id,
                            "employee"
                          )
                        }
                      >
                        Make Employee
                      </button>

                    ) : (

                      <button
                        type="button"
                        className="role-button admin-role"
                        onClick={() =>
                          changeUserRole(
                            user._id,
                            "admin"
                          )
                        }
                      >
                        Make Admin
                      </button>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>

  </>
)}
        </main>

      </div>

    </div>
  );
}

export default App;