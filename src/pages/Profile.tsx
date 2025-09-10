import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useAuthStore } from "../store/authStore";
import { useOrderStore } from "../store/orderStore";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const Profile = () => {
  const { state, dispatch } = useAppContext();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { orders, fetchMyOrders, loading } = useOrderStore();

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  const handleLogout = () => {
    logout();
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      window.alert("Please fill out all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      window.alert("New password and confirmation do not match.");
      return;
    }
    // Placeholder: integrate with backend change password endpoint when available
    window.alert("Password changed successfully (demo).");
    setIsChangePasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (!state.user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">You are not logged in.</h2>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-elevated p-8 text-center md:col-span-1">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
            {state.user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h2 className="text-2xl font-bold mb-1">{state.user.name}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {state.user.email}
          </p>
          <div className="space-y-2 text-left text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">Role</span>
              <span className="text-muted-foreground">
                {state.user.role || "Customer"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Member since</span>
              <span className="text-muted-foreground">
                {state.user && state.user.createdAt
                  ? new Date(state.user.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Dialog
              open={isChangePasswordOpen}
              onOpenChange={setIsChangePasswordOpen}
            >
              <DialogTrigger asChild>
                <Button variant="secondary">Change Password</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Update your account password.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="confirmPassword">
                      Confirm new password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="card-elevated p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
            <Table>
              <TableCaption>Your recent orders.</TableCaption>
              <TableHeader>
                <TableRow>
                  {/* <TableHead>Order</TableHead> */}
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">
                    Total (incl. 15% VAT)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const product =
                    typeof order.productId === "object"
                      ? order.productId
                      : undefined;
                  const unitPrice =
                    product && typeof product !== "string"
                      ? product.price
                      : undefined;
                  const totalWithTax = order.totalMoney * 1.15;
                  return (
                    <TableRow key={order._id}>
                      {/* <TableCell className="font-medium">{order._id}</TableCell> */}
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product &&
                            typeof product !== "string" &&
                            Array.isArray(product.image) &&
                            product.image[0] && (
                              <img
                                src={product.image[0]}
                                alt={product.name}
                                className="w-12 h-12 rounded object-cover border"
                              />
                            )}
                          <span className="line-clamp-1">
                            {product && typeof product !== "string"
                              ? product.name
                              : "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {unitPrice !== undefined
                          ? `ETB ${unitPrice.toFixed(2)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.amount}
                      </TableCell>
                      <TableCell className="text-right">{`ETB ${totalWithTax.toFixed(
                        2
                      )}`}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {loading && (
              <p className="text-sm text-muted-foreground mt-2">Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
