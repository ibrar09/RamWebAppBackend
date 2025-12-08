import * as userService from "../services/userService.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email, password required" });

    const user = await userService.createUser({ name, email, password, phone });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.loginUserService({ email, password });
    res.json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    console.log(`🔍 [getAllUsers] Request by user: ${req.user.id}`);
    const users = await userService.getAllUsersService();

    // Map default address for each user
    const mappedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      created_at: u.created_at,
      default_address: u.UserAddresses?.find(a => a.is_default)?.address_line1 || "-",
    }));

    res.status(200).json({ success: true, data: mappedUsers });
  } catch (err) {
    console.error("❌ [getAllUsers] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userService.updateUserService(id, req.body);
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await userService.getUserByIdService(id);

    if (!removed) return res.status(404).json({ error: "User not found" });

    await removed.destroy();
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await getUserByIdService(req.params.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};



export const getDashboardProfile = async (req, res) => {
  try {
    const user = await userService.getUserByIdService(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const defaultAddress = await user.getAddresses({ where: { is_default: true } });

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        default_address: defaultAddress[0] || null,
      },
    });
  } catch (err) {
    console.error("❌ [getDashboardProfile] Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
