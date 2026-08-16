import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "./Admin.module.css";

interface Tutor {
	id: number;
	email: string;
	createdAt: number;
}

export function AdminPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [tutors, setTutors] = useState<Tutor[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [newEmail, setNewEmail] = useState("");
	const [adding, setAdding] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);

	useEffect(() => {
		if (!user) {
			navigate("/login");
			return;
		}

		if (user.type !== "tutor") {
			navigate("/");
			return;
		}

		loadTutors();
	}, [user, navigate]);

	const loadTutors = async () => {
		try {
			setLoading(true);
			const result = (await api.admin.listTutors()) as {
				success: boolean;
				data?: Tutor[];
				error?: string;
			};
			if (result.success) {
				setTutors(result.data || []);
			} else {
				setError(result.error || "Failed to load tutors");
			}
		} catch (err) {
			setError("Failed to load tutors");
		} finally {
			setLoading(false);
		}
	};

	const handleAddTutor = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newEmail.trim()) return;

		try {
			setAdding(true);
			setError(null);
			const result = (await api.admin.addTutor(newEmail)) as {
				success: boolean;
				error?: string;
			};
			if (result.success) {
				setNewEmail("");
				setSuccess(`${newEmail} has been added to the tutor list!`);
				setTimeout(() => setSuccess(null), 3000);
				loadTutors();
			} else {
				setError(result.error || "Failed to add tutor");
			}
		} catch (err) {
			setError("Failed to add tutor");
		} finally {
			setAdding(false);
		}
	};

	const handleRemoveTutor = async (email: string) => {
		if (!confirm(`Remove ${email} from tutor list?`)) return;

		try {
			const result = (await api.admin.removeTutor(email)) as {
				success: boolean;
				error?: string;
			};
			if (result.success) {
				setSuccess(`${email} has been removed.`);
				setTimeout(() => setSuccess(null), 3000);
				loadTutors();
			} else {
				setError(result.error || "Failed to remove tutor");
			}
		} catch (err) {
			setError("Failed to remove tutor");
		}
	};

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<h1 className={styles.title}>Admin Panel</h1>
				<button
					type="button"
					onClick={() => navigate("/")}
					className={styles.backButton}
				>
					← Back
				</button>
			</header>

			<main className={styles.main}>
				<section className={styles.section}>
					<h2>Approved Tutors</h2>
					<p className={styles.description}>
						Manage the list of email addresses approved to create tutor
						accounts.
					</p>

					<form onSubmit={handleAddTutor} className={styles.form}>
						<div className={styles.inputGroup}>
							<input
								type="email"
								value={newEmail}
								onChange={(e) => setNewEmail(e.target.value)}
								placeholder="tutor@example.com"
								className={styles.input}
								disabled={adding}
							/>
							<button
								type="submit"
								disabled={adding || !newEmail.trim()}
								className={styles.addButton}
							>
								{adding ? "Adding..." : "Add Tutor"}
							</button>
						</div>
					</form>

					{error && <div className={styles.error}>{error}</div>}
					{success && <div className={styles.success}>{success}</div>}

					{loading ? (
						<div className={styles.loading}>Loading tutors...</div>
					) : tutors.length === 0 ? (
						<div className={styles.empty}>
							<p>No tutors approved yet.</p>
						</div>
					) : (
						<div className={styles.tutorsList}>
							{tutors.map((tutor) => (
								<div key={tutor.id} className={styles.tutorItem}>
									<div className={styles.tutorInfo}>
										<p className={styles.tutorEmail}>{tutor.email}</p>
										<p className={styles.tutorDate}>
											Added{" "}
											{new Date(tutor.createdAt * 1000).toLocaleDateString()}
										</p>
									</div>
									<button
										type="button"
										onClick={() => handleRemoveTutor(tutor.email)}
										className={styles.removeButton}
									>
										Remove
									</button>
								</div>
							))}
						</div>
					)}
				</section>
			</main>
		</div>
	);
}
