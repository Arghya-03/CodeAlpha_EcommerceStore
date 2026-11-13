
const User = require("../models/User");
const Order = require("../models/Order");

// Admin: Get all registered customers
const getAllCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: "customer" })
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        const customerStats = await Order.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: "$totalAmount" },
                },
            },
        ]);

        const statsMap = new Map(
            customerStats.map((item) => [
                item._id.toString(),
                {
                    totalOrders: item.totalOrders,
                    totalSpent: item.totalSpent,
                },
            ])
        );

        const result = customers.map((customer) => {
            const stats = statsMap.get(customer._id.toString());

            return {
                ...customer,
                totalOrders: stats?.totalOrders || 0,
                totalSpent: stats?.totalSpent || 0,
            };
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Customer fetch error:", error.message);

        res.status(500).json({
            message: "Unable to fetch customers",
        });
    }
};

module.exports = { getAllCustomers };
