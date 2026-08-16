import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Home.module.css";

export function HomePage() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	if (!user) {
		return null;
	}

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<h1 className={styles.title}>Amelia</h1>
				<div className={styles.userSection}>
					<div className={styles.userInfo}>
						<p className={styles.userName}>
							{user.firstName} {user.lastName}
						</p>
						<p className={styles.userEmail}>{user.email}</p>
						<span className={styles.badge}>{user.type}</span>
					</div>
					<div className={styles.actions}>
						{user.type === "tutor" && (
							<button
								type="button"
								onClick={() => navigate("/admin")}
								className={styles.adminButton}
							>
								Admin Panel
							</button>
						)}
						<button
							type="button"
							onClick={handleLogout}
							className={styles.logoutButton}
						>
							Logout
						</button>
					</div>
				</div>
			</header>

			<main className={styles.main}>
				<div className={styles.welcome}>
					<h2>Welcome, {user.firstName}!</h2>
					<p className={styles.message}>
						{user.type === "student"
							? "You are signed in as a student. Look for tutoring opportunities here."
							: "You are signed in as a tutor. Manage student assignments and view your profile."}
					</p>
				</div>

				<section className={styles.content}>
					<h3>Dashboard</h3>
					<div className={styles.placeholder}>
						<p>More features coming soon...</p>
					</div>
				</section>
			</main>
		</div>
	);
}
