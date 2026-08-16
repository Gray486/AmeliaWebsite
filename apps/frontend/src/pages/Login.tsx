import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import styles from "./Login.module.css";

export function LoginPage() {
	const [searchParams] = useSearchParams();
	const error = searchParams.get("error");
	const [loading, setLoading] = useState(false);

	const handleGoogleSignIn = () => {
		setLoading(true);
		api.auth.loginGoogle();
	};

	return (
		<div className={styles.container}>
			<div className={styles.hero}>
				<div className={styles.heroContent}>
					<h1 className={styles.heroTitle}>StudentsToStudents</h1>
					<p className={styles.heroSubtitle}>
						Connect with peer tutors. Learn together.
					</p>

					<div className={styles.heroFeatures}>
						<div className={styles.feature}>
							<div className={styles.featureIcon}>🎓</div>
							<div className={styles.featureText}>
								<h3>For Students</h3>
								<p>Find experienced peer tutors ready to help you succeed.</p>
							</div>
						</div>

						<div className={styles.feature}>
							<div className={styles.featureIcon}>📚</div>
							<div className={styles.featureText}>
								<h3>For Tutors</h3>
								<p>Share your knowledge and help other students learn.</p>
							</div>
						</div>

						<div className={styles.feature}>
							<div className={styles.featureIcon}>🤝</div>
							<div className={styles.featureText}>
								<h3>Community Powered</h3>
								<p>A peer-to-peer learning network that actually works.</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className={styles.card}>
				<h1 className={styles.title}>Welcome</h1>
				<p className={styles.subtitle}>Sign in to your account</p>

				{error && <div className={styles.error}>{error}</div>}

				<button
					type="button"
					onClick={handleGoogleSignIn}
					disabled={loading}
					className={styles.googleButton}
				>
					{loading ? (
						<>
							<span className={styles.spinner} />
							Signing in...
						</>
					) : (
						<>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="currentColor"
								role="img"
								aria-label="Google"
							>
								<title>Google Logo</title>
								<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
								<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
								<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
								<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
							</svg>
							Sign in with Google
						</>
					)}
				</button>

				<div className={styles.info}>
					<p>
						<strong>Students:</strong> Any Google account can sign up. Start
						finding tutors right away.
					</p>
					<p>
						<strong>Tutors:</strong> Your email needs approval from an admin to
						become a tutor.
					</p>
				</div>
			</div>
		</div>
	);
}
