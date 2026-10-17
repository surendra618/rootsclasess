import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://soni2026verma_db_user:77J1ohOBA6R5bAs4@ac-rzt2y6t-shard-00-00.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-01.5znbus6.mongodb.net:27017,ac-rzt2y6t-shard-00-02.5znbus6.mongodb.net:27017/?authSource=admin&replicaSet=atlas-icd8s6-shard-0&tls=true&appName=Cluster0";

const questionSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.Mixed, required: true },
  options: [{ type: mongoose.Schema.Types.Mixed, required: true }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
  marks: { type: Number, default: 4 },
  subject: { type: String, default: "" }
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  totalMarks: { type: Number, default: 0 },
  passingPercentage: { type: Number, default: 50 },
  duration: { type: Number },
  questions: [questionSchema],
  className: { type: String, default: "All" },
  difficulty: { type: String, default: "Medium" },
  category: { type: String, default: "General" },
  year: { type: String, default: "2026" },
  description: { type: String, default: "" },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

const Test = mongoose.models.Test || mongoose.model("Test", testSchema);

// ==========================================
// 1. GENERATE 45 MATH, 45 PHYSICS, 45 CHEMISTRY FOR JEE MAIN (TOTAL 135)
// ==========================================
function getJeeMainQuestions() {
  const mathTopics = [
    { q: "If matrix A = [[2, 1], [3, 4]], then what is the value of the determinant |A|?", opts: ["5", "8", "-5", "11"], a: "5" },
    { q: "The roots of the equation x² - 7x + 12 = 0 are:", opts: ["3 and 4", "2 and 6", "-3 and -4", "1 and 12"], a: "3 and 4" },
    { q: "If z = 3 + 4i, then the modulus |z| is:", opts: ["5", "7", "25", "1"], a: "5" },
    { q: "The 10th term of the arithmetic progression 2, 7, 12, 17, ... is:", opts: ["47", "52", "42", "49"], a: "47" },
    { q: "The sum of the infinite geometric series 1 + 1/2 + 1/4 + 1/8 + ... is:", opts: ["2", "1.5", "3", "Infinity"], a: "2" },
    { q: "The number of permutations of 5 distinct objects taken 3 at a time (⁵P₃) is:", opts: ["60", "120", "20", "10"], a: "60" },
    { q: "The number of ways to choose a committee of 3 people from 7 candidates (⁷C₃) is:", opts: ["35", "21", "42", "70"], a: "35" },
    { q: "In the expansion of (x + a)⁸, the total number of terms is:", opts: ["9", "8", "7", "10"], a: "9" },
    { q: "The slope of the line passing through (2, 3) and (6, 11) is:", opts: ["2", "4", "1/2", "3"], a: "2" },
    { q: "The distance between the parallel lines 3x + 4y = 9 and 3x + 4y = -6 is:", opts: ["3", "5", "15", "1.5"], a: "3" },
    { q: "The radius of the circle x² + y² - 4x - 6y - 12 = 0 is:", opts: ["5", "4", "25", "3"], a: "5" },
    { q: "The focus of the parabola y² = 12x is located at:", opts: ["(3, 0)", "(0, 3)", "(6, 0)", "(-3, 0)"], a: "(3, 0)" },
    { q: "The eccentricity of the ellipse x²/25 + y²/16 = 1 is:", opts: ["3/5", "4/5", "5/3", "9/25"], a: "3/5" },
    { q: "The eccentricity of the rectangular hyperbola x² - y² = a² is always:", opts: ["√2", "1", "2", "1/√2"], a: "√2" },
    { q: "The value of sin²(60°) + cos²(30°) is:", opts: ["1.5", "1", "0.5", "2"], a: "1.5" },
    { q: "The value of tan(75°) is equal to:", opts: ["2 + √3", "2 - √3", "√3 + 1", "√3 - 1"], a: "2 + √3" },
    { q: "The principal value of sin⁻¹(-1/2) is:", opts: ["-π/6", "π/6", "5π/6", "-π/3"], a: "-π/6" },
    { q: "Evaluate lim (x→0) [sin(5x) / x]:", opts: ["5", "1", "0", "Does not exist"], a: "5" },
    { q: "Evaluate lim (x→0) [(e³ˣ - 1) / x]:", opts: ["3", "1", "e³", "0"], a: "3" },
    { q: "The derivative of f(x) = x³ · ln(x) with respect to x is:", opts: ["3x² ln(x) + x²", "3x² / x", "x² ln(x)", "3x²"], a: "3x² ln(x) + x²" },
    { q: "The derivative of f(x) = tan(2x) at x = 0 is:", opts: ["2", "1", "0", "4"], a: "2" },
    { q: "The slope of the tangent to the curve y = x³ - 3x + 2 at x = 2 is:", opts: ["9", "12", "6", "3"], a: "9" },
    { q: "The function f(x) = 2x³ - 9x² + 12x + 5 is strictly increasing on:", opts: ["(-∞, 1) ∪ (2, ∞)", "(1, 2)", "(-∞, 2)", "(1, ∞)"], a: "(-∞, 1) ∪ (2, ∞)" },
    { q: "The maximum value of f(x) = sin(x) + cos(x) is:", opts: ["√2", "1", "2", "1/√2"], a: "√2" },
    { q: "Evaluate the integral ∫ (3x² + 4x - 5) dx:", opts: ["x³ + 2x² - 5x + C", "3x³ + 4x² - 5x + C", "x³ + 4x² - 5x + C", "6x + 4 + C"], a: "x³ + 2x² - 5x + C" },
    { q: "Evaluate the definite integral ∫₀¹ x · eˣ dx:", opts: ["1", "e - 1", "e", "0"], a: "1" },
    { q: "Evaluate the definite integral ∫₀^(π/2) sin²(x) dx:", opts: ["π/4", "π/2", "1", "π"], a: "π/4" },
    { q: "The area bounded by the curve y = x² and the line y = 4 is:", opts: ["32/3", "16/3", "8/3", "64/3"], a: "32/3" },
    { q: "The order and degree of differential equation (d²y/dx²)³ + (dy/dx)⁴ = y are:", opts: ["Order 2, Degree 3", "Order 3, Degree 2", "Order 2, Degree 4", "Order 4, Degree 2"], a: "Order 2, Degree 3" },
    { q: "The integrating factor of the differential equation dy/dx + (2/x)y = x³ is:", opts: ["x²", "2/x", "e^(2x)", "ln(x)"], a: "x²" },
    { q: "If vectors a = 2i + 3j - k and b = i - 2j + 4k, then their dot product a·b is:", opts: ["-8", "8", "-4", "12"], a: "-8" },
    { q: "If two vectors a and b are perpendicular, then their dot product a·b is:", opts: ["0", "1", "-1", "|a||b|"], a: "0" },
    { q: "The magnitude of the vector product |a × b| when |a|=4, |b|=5 and angle is 30° is:", opts: ["10", "20", "10√3", "5"], a: "10" },
    { q: "The direction cosines of a line equally inclined to the coordinate axes are:", opts: ["(1/√3, 1/√3, 1/√3)", "(1/3, 1/3, 1/3)", "(1, 1, 1)", "(1/√2, 1/√2, 0)"], a: "(1/√3, 1/√3, 1/√3)" },
    { q: "The distance of point (1, 2, 3) from the plane 2x + y + 2z = 4 is:", opts: ["2", "4", "6", "1"], a: "2" },
    { q: "If P(A) = 0.4, P(B) = 0.5 and P(A ∩ B) = 0.2, then P(A ∪ B) is:", opts: ["0.7", "0.9", "0.6", "0.8"], a: "0.7" },
    { q: "Two unbiased dice are rolled. The probability of getting a sum of 8 is:", opts: ["5/36", "1/6", "7/36", "1/9"], a: "5/36" },
    { q: "The mean of the numbers 4, 8, 12, 16, 20 is:", opts: ["12", "10", "14", "16"], a: "12" },
    { q: "The variance of the first n natural numbers is given by:", opts: ["(n² - 1)/12", "(n² - 1)/6", "(n + 1)/12", "n²/12"], a: "(n² - 1)/12" },
    { q: "If A and B are symmetric matrices of same order, then (AB - BA) is always a:", opts: ["Skew-symmetric matrix", "Symmetric matrix", "Zero matrix", "Identity matrix"], a: "Skew-symmetric matrix" },
    { q: "The value of determinant |[[1, a, b+c], [1, b, c+a], [1, c, a+b]]| is:", opts: ["0", "1", "a+b+c", "abc"], a: "0" },
    { q: "If |A| = 4 for a 3×3 matrix A, then the determinant |2A| is:", opts: ["32", "8", "16", "64"], a: "32" },
    { q: "The domain of the function f(x) = √(16 - x²) is:", opts: ["[-4, 4]", "(-4, 4)", "[0, 4]", "(-∞, -4] ∪ [4, ∞)"], a: "[-4, 4]" },
    { q: "If f(x) = (x - 1)/(x + 1), then f(f(x)) is equal to:", opts: ["-1/x", "1/x", "x", "-x"], a: "-1/x" },
    { q: "The relation R on set A = {1, 2, 3} given by R = {(1, 1), (2, 2), (3, 3), (1, 2), (2, 1)} is:", opts: ["Equivalence relation", "Reflexive only", "Symmetric only", "Transitive only"], a: "Equivalence relation" }
  ];

  const physicsTopics = [
    { q: "A car accelerates uniformly from rest to a speed of 72 km/h in 10 s. The distance covered is:", opts: ["100 m", "200 m", "720 m", "50 m"], a: "100 m" },
    { q: "A body of mass 5 kg is moving with a velocity of 10 m/s. Its kinetic energy is:", opts: ["250 J", "500 J", "50 J", "100 J"], a: "250 J" },
    { q: "The dimension of Planck's constant (h) is the same as that of:", opts: ["Angular momentum", "Linear momentum", "Work", "Energy"], a: "Angular momentum" },
    { q: "The work done by a centripetal force on a particle moving in a circular path is always:", opts: ["Zero", "Positive", "Negative", "Infinite"], a: "Zero" },
    { q: "The escape velocity from the surface of Earth is approximately:", opts: ["11.2 km/s", "9.8 km/s", "7.9 km/s", "42 km/s"], a: "11.2 km/s" },
    { q: "The acceleration due to gravity at the center of the Earth is:", opts: ["Zero", "9.8 m/s²", "Infinite", "4.9 m/s²"], a: "Zero" },
    { q: "Young's modulus of a perfectly rigid body is:", opts: ["Infinite", "Zero", "1", "10¹¹ N/m²"], a: "Infinite" },
    { q: "The terminal velocity of a small spherical ball falling in a viscous liquid varies with radius r as:", opts: ["r²", "r", "1/r", "r³"], a: "r²" },
    { q: "Water rises to a height of 10 cm in a capillary tube. If tube radius is doubled, the height will be:", opts: ["5 cm", "10 cm", "20 cm", "2.5 cm"], a: "5 cm" },
    { q: "The efficiency of a Carnot engine operating between 500 K and 300 K is:", opts: ["40%", "60%", "20%", "50%"], a: "40%" },
    { q: "In an adiabatic process for an ideal gas, the relation between P and V is:", opts: ["P·V^γ = constant", "P·V = constant", "P/V = constant", "P^γ·V = constant"], a: "P·V^γ = constant" },
    { q: "The average kinetic energy of gas molecules per degree of freedom is:", opts: ["(1/2) k_B T", "(3/2) k_B T", "k_B T", "3 k_B T"], a: "(1/2) k_B T" },
    { q: "The time period of a simple pendulum of length L on the Moon (g_moon = g/6) will:", opts: ["Increase by √6 times", "Decrease by √6 times", "Remain unchanged", "Increase by 6 times"], a: "Increase by √6 times" },
    { q: "In a Simple Harmonic Motion, the phase difference between velocity and acceleration is:", opts: ["π/2 rad", "π rad", "0", "π/4 rad"], a: "π/2 rad" },
    { q: "The speed of sound in air at 0°C is 330 m/s. If the pressure of air is doubled at constant temperature, the speed will be:", opts: ["330 m/s", "660 m/s", "165 m/s", "330√2 m/s"], a: "330 m/s" },
    { q: "Two waves of frequencies 256 Hz and 260 Hz are sounded together. The number of beats heard per second is:", opts: ["4", "2", "8", "516"], a: "4" },
    { q: "The electric field inside a charged hollow spherical conductor is:", opts: ["Zero", "Uniform and non-zero", "Decreases with distance", "Infinite"], a: "Zero" },
    { q: "Three capacitors each of capacitance 6 µF are connected in series. The equivalent capacitance is:", opts: ["2 µF", "18 µF", "6 µF", "9 µF"], a: "2 µF" },
    { q: "The electrostatic potential at a point on the equatorial line of an electric dipole is:", opts: ["Zero", "Maximum", "Infinite", "Negative"], a: "Zero" },
    { q: "A wire of resistance R is stretched to double its original length. Its new resistance becomes:", opts: ["4R", "2R", "R/2", "R/4"], a: "4R" },
    { q: "Kirchhoff's first law (Junction rule) is based on the conservation of:", opts: ["Electric charge", "Energy", "Momentum", "Angular momentum"], a: "Electric charge" },
    { q: "Kirchhoff's second law (Loop rule) is based on the conservation of:", opts: ["Energy", "Electric charge", "Linear momentum", "Mass"], a: "Energy" },
    { q: "The magnetic field at the center of a circular coil of radius R carrying current I is:", opts: ["µ₀I / (2R)", "µ₀I / (4πR)", "µ₀I / (2πR)", "µ₀IR / 2"], a: "µ₀I / (2R)" },
    { q: "A charged particle moves perpendicular to a uniform magnetic field. The path of the particle is:", opts: ["A circle", "A straight line", "A parabola", "A helix"], a: "A circle" },
    { q: "The SI unit of magnetic flux is:", opts: ["Weber", "Tesla", "Henry", "Gauss"], a: "Weber" },
    { q: "Lenz's law is a consequence of the law of conservation of:", opts: ["Energy", "Charge", "Momentum", "Mass"], a: "Energy" },
    { q: "The self-inductance of a solenoid with N turns varies directly with:", opts: ["N²", "N", "1/N", "√N"], a: "N²" },
    { q: "In a pure capacitive AC circuit, the current:", opts: ["Leads voltage by π/2", "Lags voltage by π/2", "Is in phase with voltage", "Lags voltage by π"], a: "Leads voltage by π/2" },
    { q: "The resonant frequency of a series LCR circuit is given by:", opts: ["1 / (2π√(LC))", "2π√(LC)", "√(LC) / 2π", "1 / (√(LC))"], a: "1 / (2π√(LC))" },
    { q: "The electromagnetic waves with the highest frequency among the following are:", opts: ["Gamma rays", "X-rays", "Ultraviolet rays", "Microwaves"], a: "Gamma rays" },
    { q: "A convex mirror of focal length 20 cm always forms an image that is:", opts: ["Virtual, erect and diminished", "Real, inverted and magnified", "Virtual, inverted and magnified", "Real, erect and diminished"], a: "Virtual, erect and diminished" },
    { q: "The critical angle for glass-air interface is 42°. The refractive index of glass is approximately:", opts: ["1.5", "1.33", "2.0", "1.2"], a: "1.5" },
    { q: "In Young's double slit experiment, if the distance between slits is halved, fringe width will:", opts: ["Double", "Halve", "Remain same", "Become four times"], a: "Double" },
    { q: "Brewster's angle θ_p is related to refractive index µ of the medium by:", opts: ["µ = tan(θ_p)", "µ = sin(θ_p)", "µ = cos(θ_p)", "µ = cot(θ_p)"], a: "µ = tan(θ_p)" },
    { q: "The de Broglie wavelength associated with a particle of mass m moving with velocity v is:", opts: ["h / (mv)", "mv / h", "h · mv", "h / √(mv)"], a: "h / (mv)" },
    { q: "According to Einstein's photoelectric equation, the slope of K_max vs frequency graph is:", opts: ["Planck's constant (h)", "Work function (Φ)", "Electronic charge (e)", "h/e"], a: "Planck's constant (h)" },
    { q: "The radius of the nth Bohr orbit in hydrogen atom is proportional to:", opts: ["n²", "n", "1/n", "1/n²"], a: "n²" },
    { q: "The energy of an electron in the first excited state (n = 2) of hydrogen atom is:", opts: ["-3.4 eV", "-13.6 eV", "-1.51 eV", "-0.85 eV"], a: "-3.4 eV" },
    { q: "The nuclear force between two nucleons is:", opts: ["Short-range, attractive and charge independent", "Long-range and gravitational", "Repulsive at all distances", "Electromagnetic in nature"], a: "Short-range, attractive and charge independent" },
    { q: "The half-life of a radioactive substance is 10 days. The fraction remaining after 30 days is:", opts: ["1/8", "1/4", "1/16", "1/2"], a: "1/8" },
    { q: "In an intrinsic semiconductor at absolute zero temperature (0 K), the electrical conductivity is:", opts: ["Zero (acts as insulator)", "Infinite (superconductor)", "Very high", "Same as metals"], a: "Zero (acts as insulator)" },
    { q: "In an n-type semiconductor, the majority charge carriers are:", opts: ["Electrons", "Holes", "Protons", "Neutrons"], a: "Electrons" },
    { q: "A p-n junction diode conducts current predominantly when it is:", opts: ["Forward biased", "Reverse biased", "Unbiased", "Grounded"], a: "Forward biased" },
    { q: "The logic gate whose output is HIGH only when both inputs are HIGH is:", opts: ["AND gate", "OR gate", "NAND gate", "NOR gate"], a: "AND gate" },
    { q: "A Zener diode is specially designed to operate continuously in the:", opts: ["Reverse breakdown region", "Forward active region", "Cut-off region", "Saturation region"], a: "Reverse breakdown region" }
  ];

  const chemistryTopics = [
    { q: "The number of moles of solute present in 1 liter of solution is defined as:", opts: ["Molarity", "Molality", "Mole fraction", "Normality"], a: "Molarity" },
    { q: "The number of atoms present in 4.0 g of Helium gas (atomic mass = 4) is:", opts: ["6.022 × 10²³ (N_A)", "3.011 × 10²³", "1.204 × 10²⁴", "2.4 × 10²³"], a: "6.022 × 10²³ (N_A)" },
    { q: "The maximum number of electrons that can be accommodated in the 3d subshell is:", opts: ["10", "6", "14", "2"], a: "10" },
    { q: "Which of the following sets of quantum numbers is NOT permissible for an electron?", opts: ["n=3, l=3, m=0, s=+1/2", "n=2, l=1, m=0, s=-1/2", "n=4, l=2, m=-1, s=+1/2", "n=1, l=0, m=0, s=+1/2"], a: "n=3, l=3, m=0, s=+1/2" },
    { q: "The hybridization and shape of the SF₆ molecule are:", opts: ["sp³d², Octahedral", "sp³d, Trigonal bipyramidal", "sp³, Tetrahedral", "dsp², Square planar"], a: "sp³d², Octahedral" },
    { q: "According to VSEPR theory, the shape of the water (H₂O) molecule is:", opts: ["Bent (V-shaped)", "Linear", "Tetrahedral", "Trigonal planar"], a: "Bent (V-shaped)" },
    { q: "The bond order of the oxygen molecule (O₂) according to Molecular Orbital Theory is:", opts: ["2", "2.5", "1.5", "3"], a: "2" },
    { q: "For a spontaneous process at constant temperature and pressure, ΔG must be:", opts: ["Negative (< 0)", "Positive (> 0)", "Zero", "Equal to ΔH"], a: "Negative (< 0)" },
    { q: "In an endothermic reaction at constant pressure:", opts: ["ΔH is positive", "ΔH is negative", "ΔH = 0", "ΔS is zero"], a: "ΔH is positive" },
    { q: "The pH of a 0.001 M HCl solution at 25°C is:", opts: ["3", "4", "2", "1"], a: "3" },
    { q: "According to Le Chatelier's principle, for N₂(g) + 3H₂(g) ⇌ 2NH₃(g) + Heat, high yield of NH₃ is favored by:", opts: ["High pressure and low temperature", "Low pressure and high temperature", "High pressure and high temperature", "Low pressure and low temperature"], a: "High pressure and low temperature" },
    { q: "The oxidation state of Chromium in K₂Cr₂O₇ is:", opts: ["+6", "+7", "+3", "+5"], a: "+6" },
    { q: "The oxidation state of Manganese in KMnO₄ is:", opts: ["+7", "+6", "+4", "+2"], a: "+7" },
    { q: "The standard electrode potential of Standard Hydrogen Electrode (SHE) is assigned as:", opts: ["0.00 V", "1.00 V", "0.50 V", "-1.00 V"], a: "0.00 V" },
    { q: "The unit of rate constant for a first-order chemical reaction is:", opts: ["s⁻¹", "mol·L⁻¹·s⁻¹", "L·mol⁻¹·s⁻¹", "mol⁻¹·L·s⁻¹"], a: "s⁻¹" },
    { q: "The half-life period (t_1/2) for a first-order reaction is independent of:", opts: ["Initial concentration of reactant", "Temperature", "Rate constant", "Catalyst"], a: "Initial concentration of reactant" },
    { q: "Tyndall effect is observed in which type of mixtures?", opts: ["Colloidal solutions", "True solutions", "Precipitates", "Super-saturated solutions"], a: "Colloidal solutions" },
    { q: "Which of the following is a colligative property of dilute solutions?", opts: ["Osmotic pressure", "Boiling point", "Density", "Viscosity"], a: "Osmotic pressure" },
    { q: "The van 't Hoff factor (i) for completely dissociated BaCl₂ in dilute solution is:", opts: ["3", "2", "1", "4"], a: "3" },
    { q: "The element with the highest electronegativity in the periodic table is:", opts: ["Fluorine (F)", "Oxygen (O)", "Chlorine (Cl)", "Nitrogen (N)"], a: "Fluorine (F)" },
    { q: "The inert pair effect is most pronounced in heavier elements of which group?", opts: ["p-block", "s-block", "d-block", "f-block"], a: "p-block" },
    { q: "Which of the following noble gases is most abundant in Earth's atmosphere?", opts: ["Argon (Ar)", "Helium (He)", "Neon (Ne)", "Xenon (Xe)"], a: "Argon (Ar)" },
    { q: "Transition metals show variable oxidation states primarily due to:", opts: ["Involvement of (n-1)d and ns electrons", "Small atomic radii", "High ionization enthalpy", "Vacant p-orbitals"], a: "Involvement of (n-1)d and ns electrons" },
    { q: "Which of the following ions is colored in aqueous solution due to d-d transition?", opts: ["Cu²⁺ (3d⁹)", "Sc³⁺ (3d⁰)", "Zn²⁺ (3d¹⁰)", "Ti⁴⁺ (3d⁰)"], a: "Cu²⁺ (3d⁹)" },
    { q: "The IUPAC name of the complex [Co(NH₃)₆]Cl₃ is:", opts: ["Hexaamminecobalt(III) chloride", "Hexaamminecobalt(II) chloride", "Cobalt(III) hexammine chloride", "Hexachlorocobalt(III) amine"], a: "Hexaamminecobalt(III) chloride" },
    { q: "The coordination number and oxidation state of Fe in K₄[Fe(CN)₆] are:", opts: ["6 and +2", "6 and +3", "4 and +2", "4 and +3"], a: "6 and +2" },
    { q: "The hybrid state of carbon in benzene ring is:", opts: ["sp²", "sp³", "sp", "dsp²"], a: "sp²" },
    { q: "Which of the following carbocations is the most stable due to hyperconjugation?", opts: ["(CH₃)₃C⁺ (Tertiary)", "(CH₃)₂CH⁺ (Secondary)", "CH₃CH₂⁺ (Primary)", "CH₃⁺ (Methyl)"], a: "(CH₃)₃C⁺ (Tertiary)" },
    { q: "The electrophile involved in the nitration of benzene with conc. HNO₃ + H₂SO₄ is:", opts: ["NO₂⁺ (Nitronium ion)", "NO⁺ (Nitrosonium ion)", "NO₂⁻", "NO₃⁻"], a: "NO₂⁺ (Nitronium ion)" },
    { q: "Markovnikov's rule applies to the addition of HBr to which type of alkene?", opts: ["Unsymmetrical alkenes (e.g. Propene)", "Symmetrical alkenes (e.g. Ethene)", "Cyclohexane", "Alkanes"], a: "Unsymmetrical alkenes (e.g. Propene)" },
    { q: "In the presence of organic peroxides, addition of HBr to propene gives:", opts: ["1-Bromopropane (Anti-Markovnikov)", "2-Bromopropane", "1,2-Dibromopropane", "2,2-Dibromopropane"], a: "1-Bromopropane (Anti-Markovnikov)" },
    { q: "The major product of reaction between ethyl bromide and alcoholic KOH is:", opts: ["Ethene (Elimination)", "Ethanol", "Diethyl ether", "Ethane"], a: "Ethene (Elimination)" },
    { q: "An S_N2 mechanism follows which kinetics and stereochemical outcome?", opts: ["Second order with complete inversion (Walden inversion)", "First order with racemization", "Second order with retention", "First order with inversion"], a: "Second order with complete inversion (Walden inversion)" },
    { q: "Lucas reagent used to distinguish primary, secondary, and tertiary alcohols is:", opts: ["Anhydrous ZnCl₂ + conc. HCl", "Dilute HCl + Zn", "Conc. H₂SO₄ + KMnO₄", "Alkaline KMnO₄"], a: "Anhydrous ZnCl₂ + conc. HCl" },
    { q: "Phenol on distillation with Zinc dust yields:", opts: ["Benzene", "Toluene", "Benzoic acid", "Cyclohexane"], a: "Benzene" },
    { q: "Reimer-Tiemann reaction converts phenol into:", opts: ["Salicylaldehyde", "Salicylic acid", "Benzoic acid", "Picric acid"], a: "Salicylaldehyde" },
    { q: "Which of the following compounds gives a silver mirror with Tollens' reagent?", opts: ["Acetaldehyde (CH₃CHO)", "Acetone (CH₃COCH₃)", "Acetic acid", "Ethyl alcohol"], a: "Acetaldehyde (CH₃CHO)" },
    { q: "The Cannizzaro reaction is characteristic of aldehydes that:", opts: ["Lack an α-hydrogen (e.g. HCHO, C₆H₅CHO)", "Contain at least one α-hydrogen", "Are aromatic ketones", "Are aliphatic ketones"], a: "Lack an α-hydrogen (e.g. HCHO, C₆H₅CHO)" },
    { q: "The product formed by the reaction of acetamide with Br₂ and NaOH (Hoffmann bromamide degradation) is:", opts: ["Methylamine", "Ethylamine", "Methanol", "Formamide"], a: "Methylamine" },
    { q: "Which test is used to detect primary aliphatic and aromatic amines using chloroform and alcoholic KOH?", opts: ["Carbylamine test", "Biuret test", "Fehling's test", "Ninhydrin test"], a: "Carbylamine test" },
    { q: "The sugar present in RNA is:", opts: ["D-Ribose", "2-Deoxy-D-ribose", "D-Glucose", "D-Fructose"], a: "D-Ribose" },
    { q: "The linkage that holds amino acids together in proteins is called:", opts: ["Peptide linkage (-CONH-)", "Glycosidic linkage", "Phosphodiester linkage", "Ester linkage"], a: "Peptide linkage (-CONH-)" },
    { q: "Deficiency of Vitamin C in human diet causes which disease?", opts: ["Scurvy", "Rickets", "Beri-beri", "Night blindness"], a: "Scurvy" },
    { q: "Monomers of the synthetic polymer Nylon-6,6 are:", opts: ["Hexamethylenediamine and Adipic acid", "Caprolactam", "Ethylene glycol and Terephthalic acid", "Phenol and Formaldehyde"], a: "Hexamethylenediamine and Adipic acid" },
    { q: "Aspirin chemically is known as:", opts: ["Acetylsalicylic acid", "Methyl salicylate", "Phenyl salicylate", "Salicylic acid"], a: "Acetylsalicylic acid" }
  ];

  const questions = [];

  // Math (1 to 45)
  mathTopics.forEach((item, i) => {
    questions.push({
      subject: "Mathematics",
      question: item.q,
      options: item.opts,
      correctAnswer: item.a,
      marks: 4
    });
  });

  // Physics (46 to 90)
  physicsTopics.forEach((item, i) => {
    questions.push({
      subject: "Physics",
      question: item.q,
      options: item.opts,
      correctAnswer: item.a,
      marks: 4
    });
  });

  // Chemistry (91 to 135)
  chemistryTopics.forEach((item, i) => {
    questions.push({
      subject: "Chemistry",
      question: item.q,
      options: item.opts,
      correctAnswer: item.a,
      marks: 4
    });
  });

  return questions;
}

// ==========================================
// 2. GENERATE 45 PHYSICS, 45 CHEMISTRY, 45 BOTANY, 45 ZOOLOGY FOR NEET (TOTAL 180)
// ==========================================
function getNeetQuestions() {
  const jeeQuestions = getJeeMainQuestions();
  const physics45 = jeeQuestions.filter(q => q.subject === "Physics");
  const chem45 = jeeQuestions.filter(q => q.subject === "Chemistry");

  const botanyQuestions = [
    { q: "The powerhouse of the cell where ATP synthesis takes place is:", opts: ["Mitochondria", "Ribosome", "Golgi apparatus", "Lysosome"], a: "Mitochondria" },
    { q: "The site of photosynthesis in plant cells is:", opts: ["Chloroplast", "Chromoplast", "Leucoplast", "Amyloplast"], a: "Chloroplast" },
    { q: "In C3 plants, the primary CO₂ acceptor molecule is:", opts: ["RuBP (Ribulose 1,5-bisphosphate)", "PEP (Phosphoenolpyruvate)", "OAA (Oxaloacetic acid)", "PGA (3-Phosphoglyceric acid)"], a: "RuBP (Ribulose 1,5-bisphosphate)" },
    { q: "In C4 plants (like maize and sugarcane), the primary CO₂ fixation takes place in:", opts: ["Mesophyll cells", "Bundle sheath cells", "Epidermal cells", "Guard cells"], a: "Mesophyll cells" },
    { q: "The plant growth hormone responsible for apical dominance is:", opts: ["Auxin", "Gibberellin", "Cytokinin", "Abscisic acid"], a: "Auxin" },
    { q: "The gaseous phytohormone that promotes fruit ripening is:", opts: ["Ethylene", "Abscisic acid", "Auxin", "Cytokinin"], a: "Ethylene" },
    { q: "Double fertilization is a characteristic feature unique to:", opts: ["Angiosperms", "Gymnosperms", "Pteridophytes", "Bryophytes"], a: "Angiosperms" },
    { q: "The ploidy level of endosperm in typical angiosperms is:", opts: ["Triploid (3n)", "Diploid (2n)", "Haploid (n)", "Tetraploid (4n)"], a: "Triploid (3n)" },
    { q: "Water and mineral transport in vascular plants occurs through:", opts: ["Xylem", "Phloem", "Cortex", "Pith"], a: "Xylem" },
    { q: "Phloem transports food primarily in the form of:", opts: ["Sucrose", "Glucose", "Starch", "Fructose"], a: "Sucrose" },
    { q: "The element essential for the photolysis of water during photosynthesis is:", opts: ["Manganese (Mn) and Chlorine (Cl)", "Iron (Fe)", "Magnesium (Mg)", "Zinc (Zn)"], a: "Manganese (Mn) and Chlorine (Cl)" },
    { q: "The central metallic atom present in chlorophyll pigment is:", opts: ["Magnesium (Mg)", "Iron (Fe)", "Copper (Cu)", "Manganese (Mn)"], a: "Magnesium (Mg)" },
    { q: "Gregor Mendel conducted his famous hybridization experiments on:", opts: ["Garden pea (Pisum sativum)", "Sweet pea (Lathyrus odoratus)", "Fruit fly (Drosophila)", "Snapdragon"], a: "Garden pea (Pisum sativum)" },
    { q: "The phenotypic ratio of a standard Mendelian dihybrid cross in F2 generation is:", opts: ["9:3:3:1", "3:1", "1:2:1", "9:7"], a: "9:3:3:1" },
    { q: "Incomplete dominance is classically observed in the flower color of:", opts: ["Mirabilis jalapa (4 o'clock plant)", "Pisum sativum", "Oenothera lamarckiana", "Triticum aestivum"], a: "Mirabilis jalapa (4 o'clock plant)" },
    { q: "During DNA replication, the enzyme that unwinds the DNA double helix is:", opts: ["DNA Helicase", "DNA Polymerase", "DNA Ligase", "RNA Primase"], a: "DNA Helicase" },
    { q: "The start codon that codes for Methionine in mRNA translation is:", opts: ["AUG", "UAA", "UAG", "UGA"], a: "AUG" },
    { q: "Which of the following codons serves as a stop (nonsense) codon?", opts: ["UAA, UAG, UGA", "AUG, GUG, UUG", "AAA, UUU, CCC", "AUG only"], a: "UAA, UAG, UGA" },
    { q: "The enzyme responsible for transcription in prokaryotes is:", opts: ["RNA Polymerase", "DNA Polymerase I", "Reverse transcriptase", "Peptidyl transferase"], a: "RNA Polymerase" },
    { q: "Okazaki fragments synthesized during DNA replication are joined together by:", opts: ["DNA Ligase", "DNA Polymerase III", "Topoisomerase", "Endonuclease"], a: "DNA Ligase" },
    { q: "Plasmids used as cloning vectors in genetic engineering are:", opts: ["Circular, extrachromosomal DNA in bacteria", "Linear viral RNA", "Bacterial chromosomal DNA", "Nuclear DNA of yeast"], a: "Circular, extrachromosomal DNA in bacteria" },
    { q: "Restriction endonucleases cut DNA at specific sequences known as:", opts: ["Palindromic recognition sequences", "Promoter sequences", "Terminator sequences", "Poly-A tails"], a: "Palindromic recognition sequences" },
    { q: "Polymerase Chain Reaction (PCR) technique utilizes a heat-stable DNA polymerase called:", opts: ["Taq Polymerase", "DNA Polymerase I", "Vent Polymerase", "Pfu Polymerase"], a: "Taq Polymerase" },
    { q: "Bt toxin protein produced by Bacillus thuringiensis crystals kills insects by:", opts: ["Binding to midgut epithelial cells causing lysis", "Inhibiting protein synthesis in ribosomes", "Paralyzing nervous system", "Blocking DNA replication"], a: "Binding to midgut epithelial cells causing lysis" },
    { q: "The Golden Rice variety has been genetically modified to produce high levels of:", opts: ["Beta-carotene (Pro-vitamin A)", "Vitamin C", "Iron", "Essential amino acids"], a: "Beta-carotene (Pro-vitamin A)" },
    { q: "The symbiotic association between fungi and roots of higher plants is called:", opts: ["Mycorrhiza", "Lichen", "Mutualism", "Commensalism"], a: "Mycorrhiza" },
    { q: "Lichens are known as sensitive bioindicators of air pollution, especially for:", opts: ["Sulfur dioxide (SO₂)", "Carbon monoxide (CO)", "Ozone (O₃)", "Methane (CH₄)"], a: "Sulfur dioxide (SO₂)" },
    { q: "The 10% law of energy transfer in an ecological food chain was proposed by:", opts: ["Raymond Lindeman", "Eugene Odum", "Arthur Tansley", "Ernst Haeckel"], a: "Raymond Lindeman" },
    { q: "In an ecosystem, pyramid of energy is always:", opts: ["Upright", "Inverted", "Spindle-shaped", "Variable"], a: "Upright" },
    { q: "Which of the following is considered the primary hot spot of biodiversity in India?", opts: ["Western Ghats", "Eastern Himalayas", "Indo-Burma", "All of the above"], a: "All of the above" },
    { q: "The Montreal Protocol (1987) was signed to protect the environment against:", opts: ["Ozone layer depletion by ODS", "Global warming", "Deforestation", "Hazardous nuclear waste"], a: "Ozone layer depletion by ODS" },
    { q: "The primary greenhouse gas responsible for anthropogenic global warming is:", opts: ["Carbon dioxide (CO₂)", "Methane (CH₄)", "Nitrous oxide (N₂O)", "CFCs"], a: "Carbon dioxide (CO₂)" },
    { q: "Kranz anatomy is a distinctive structural adaptation seen in the leaves of:", opts: ["C4 plants", "C3 plants", "CAM plants", "Hydrophytes"], a: "C4 plants" },
    { q: "The process of nitrogen fixation in root nodules of leguminous plants is catalyzed by:", opts: ["Nitrogenase", "Nitrate reductase", "Glutamine synthetase", "Dehydrogenase"], a: "Nitrogenase" },
    { q: "Leghaemoglobin acts as an oxygen scavenger in legume root nodules to protect:", opts: ["Nitrogenase enzyme", "Amylase enzyme", "Chlorophyll", "RuBisCO"], a: "Nitrogenase enzyme" },
    { q: "The stomatal opening and closing mechanism is primarily regulated by the influx and efflux of:", opts: ["Potassium ions (K⁺)", "Sodium ions (Na⁺)", "Calcium ions (Ca²⁺)", "Chloride ions (Cl⁻)"], a: "Potassium ions (K⁺)" },
    { q: "Guttation, the loss of liquid water droplets from leaves, occurs through specialized pores called:", opts: ["Hydathodes", "Stomata", "Lenticels", "Pneumatophores"], a: "Hydathodes" },
    { q: "In aerobic respiration, the terminal electron acceptor of the electron transport chain (ETC) is:", opts: ["Molecular oxygen (O₂)", "Cytochrome c", "NAD⁺", "FAD"], a: "Molecular oxygen (O₂)" },
    { q: "Net ATP yield from complete aerobic oxidation of one glucose molecule is approximately:", opts: ["30 to 32 ATP", "36 to 38 ATP", "2 ATP", "24 ATP"], a: "30 to 32 ATP" },
    { q: "Casparin strips are water-impermeable suberin deposits found in the plant tissue layer of:", opts: ["Endodermis", "Epidermis", "Pericycle", "Hypodermis"], a: "Endodermis" },
    { q: "The type of vascular bundles in dicot stems is:", opts: ["Conjoint, collateral, open", "Conjoint, collateral, closed", "Radial", "Concentric"], a: "Conjoint, collateral, open" },
    { q: "Annual growth rings in temperate woody trees are formed due to differential activity of:", opts: ["Vascular cambium", "Cork cambium", "Apical meristem", "Intercalary meristem"], a: "Vascular cambium" },
    { q: "The male gametophyte of an angiosperm at the time of pollination is usually shed at:", opts: ["2-celled or 3-celled stage", "1-celled stage", "4-celled stage", "8-celled stage"], a: "2-celled or 3-celled stage" },
    { q: "Development of fruits without fertilization is known as:", opts: ["Parthenocarpy", "Parthenogenesis", "Apomixis", "Polyembryony"], a: "Parthenocarpy" },
    { q: "The phenomenon where seeds are formed without fertilization from maternal tissues is:", opts: ["Apomixis", "Parthenocarpy", "Amphimixis", "Vegetative propagation"], a: "Apomixis" }
  ];

  const zoologyQuestions = [
    { q: "The structural and functional unit of the human kidney is the:", opts: ["Nephron", "Neuron", "Alveolus", "Glomerulus"], a: "Nephron" },
    { q: "The normal resting blood pressure of an adult human is considered to be:", opts: ["120/80 mmHg", "140/90 mmHg", "100/60 mmHg", "80/120 mmHg"], a: "120/80 mmHg" },
    { q: "The natural pacemaker of the human heart that initiates action potentials is:", opts: ["Sinoatrial (SA) node", "Atrioventricular (AV) node", "Bundle of His", "Purkinje fibers"], a: "Sinoatrial (SA) node" },
    { q: "The volume of air inspired or expired during normal quiet breathing is called:", opts: ["Tidal Volume (TV)", "Inspiratory Reserve Volume (IRV)", "Vital Capacity (VC)", "Residual Volume (RV)"], a: "Tidal Volume (TV)" },
    { q: "Oxygen is predominantly transported in human blood bound to:", opts: ["Hemoglobin as oxyhemoglobin", "Dissolved in plasma", "As bicarbonate ions", "Carbamino-hemoglobin"], a: "Hemoglobin as oxyhemoglobin" },
    { q: "Carbon dioxide (CO₂) is primarily transported in blood in the form of:", opts: ["Bicarbonate ions (HCO₃⁻)", "Carbamino-hemoglobin", "Dissolved gas in plasma", "Carbonic acid"], a: "Bicarbonate ions (HCO₃⁻)" },
    { q: "Hydrochloric acid (HCl) in gastric juice is secreted by:", opts: ["Oxyntic (Parietal) cells", "Peptic (Chief) cells", "Mucous neck cells", "G-cells"], a: "Oxyntic (Parietal) cells" },
    { q: "Bile juice is synthesized by the:", opts: ["Liver", "Gall bladder", "Pancreas", "Duodenum"], a: "Liver" },
    { q: "The enzyme salivary amylase (ptyalin) initiates digestion of:", opts: ["Starch into maltose", "Proteins into peptides", "Fats into fatty acids", "Nucleic acids"], a: "Starch into maltose" },
    { q: "Myelin sheath around nerve axons in the peripheral nervous system is produced by:", opts: ["Schwann cells", "Oligodendrocytes", "Astrocytes", "Microglia"], a: "Schwann cells" },
    { q: "During depolarization of an axon membrane, there is a rapid influx of:", opts: ["Sodium ions (Na⁺)", "Potassium ions (K⁺)", "Calcium ions (Ca²⁺)", "Chloride ions (Cl⁻)"], a: "Sodium ions (Na⁺)" },
    { q: "The master endocrine gland that controls most other hormone-producing glands is:", opts: ["Pituitary gland", "Thyroid gland", "Adrenal cortex", "Parathyroid gland"], a: "Pituitary gland" },
    { q: "Insulin hormone is secreted by which pancreatic islet cells?", opts: ["Beta (β) cells", "Alpha (α) cells", "Delta (δ) cells", "F cells"], a: "Beta (β) cells" },
    { q: "The hormone that stimulates milk ejection (let-down reflex) from mammary glands is:", opts: ["Oxytocin", "Prolactin", "Estrogen", "Progesterone"], a: "Oxytocin" },
    { q: "In human females, ovulation is directly triggered by a surge in which hormone?", opts: ["Luteinizing Hormone (LH)", "Follicle Stimulating Hormone (FSH)", "Estrogen", "Progesterone"], a: "Luteinizing Hormone (LH)" },
    { q: "Fertilization of human ovum typically takes place in the:", opts: ["Ampulla of fallopian tube", "Uterine cavity", "Isthmus of oviduct", "Infundibulum"], a: "Ampulla of fallopian tube" },
    { q: "The embryonic stage that implants into the endometrium of the uterus is the:", opts: ["Blastocyst", "Morula", "Zygote", "Gastrula"], a: "Blastocyst" },
    { q: "Which immunoglobulin is abundant in colostrum (first mother's milk)?", opts: ["IgA", "IgG", "IgM", "IgE"], a: "IgA" },
    { q: "The immunoglobulin involved in allergic reactions and mediator release is:", opts: ["IgE", "IgA", "IgG", "IgD"], a: "IgE" },
    { q: "HIV (Human Immunodeficiency Virus) specifically targets and destroys:", opts: ["Helper T lymphocytes (CD4+ T cells)", "Cytotoxic T cells", "B lymphocytes", "Erythrocytes"], a: "Helper T lymphocytes (CD4+ T cells)" },
    { q: "The causative agent of Malaria in humans is the protozoan:", opts: ["Plasmodium", "Entamoeba", "Leishmania", "Trypanosoma"], a: "Plasmodium" },
    { q: "Vector responsible for transmitting the dengue virus is:", opts: ["Aedes aegypti mosquito", "Anopheles mosquito", "Culex mosquito", "Tsetse fly"], a: "Aedes aegypti mosquito" },
    { q: "Widal test is widely utilized for the laboratory diagnosis of:", opts: ["Typhoid fever", "Cholera", "Tuberculosis", "Malaria"], a: "Typhoid fever" },
    { q: "The theory of Natural Selection was formulated and published by:", opts: ["Charles Darwin", "Jean-Baptiste Lamarck", "Hugo de Vries", "Gregor Mendel"], a: "Charles Darwin" },
    { q: "Homologous organs (like forelimbs of humans, cheetah, bat, whale) provide evidence for:", opts: ["Divergent evolution", "Convergent evolution", "Parallel evolution", "Saltation"], a: "Divergent evolution" },
    { q: "Analogous organs (like wings of butterfly and wings of bird) are a result of:", opts: ["Convergent evolution", "Divergent evolution", "Genetic drift", "Adaptive radiation"], a: "Convergent evolution" },
    { q: "Hardy-Weinberg equilibrium equation for genetic equilibrium in a population is:", opts: ["p² + 2pq + q² = 1", "p² + q² = 1", "p + q = 2", "p² + 2p + q = 1"], a: "p² + 2pq + q² = 1" },
    { q: "The industrial melanism observed in the Peppered moth (Biston betularia) in England is evidence of:", opts: ["Natural selection", "Mutation", "Genetic drift", "Artificial selection"], a: "Natural selection" },
    { q: "Somatic chromosome number in humans suffering from Down's syndrome (Trisomy 21) is:", opts: ["47", "45", "46", "48"], a: "47" },
    { q: "Turner's syndrome in human females is characterized by the sex chromosome karyotype:", opts: ["45, XO", "47, XXY", "47, XYY", "47, XXX"], a: "45, XO" },
    { q: "Klinefelter's syndrome is characterized by the sex chromosomal composition:", opts: ["47, XXY", "45, XO", "47, XYY", "46, XY"], a: "47, XXY" },
    { q: "Hemophilia and Red-Green color blindness in humans are examples of:", opts: ["X-linked recessive disorders", "Autosomal dominant disorders", "Autosomal recessive disorders", "Y-linked disorders"], a: "X-linked recessive disorders" },
    { q: "Sickle-cell anemia is caused by a point mutation replacing Glutamic acid with:", opts: ["Valine at position 6 of beta-globin chain", "Leucine", "Lysine", "Alanine"], a: "Valine at position 6 of beta-globin chain" },
    { q: "The non-surgical, barrier method of contraception for females that fits over the cervix is:", opts: ["Diaphragm / Cervical cap", "Lippes loop", "Copper-T", "Oral contraceptive pill"], a: "Diaphragm / Cervical cap" },
    { q: "Copper ions releasing IUDs (like Cu-T 380A) suppress:", opts: ["Sperm motility and fertilizing capacity", "Ovulation", "Menstruation", "Endometrium maturation only"], a: "Sperm motility and fertilizing capacity" },
    { q: "Surgical permanent sterilization procedure in human males is called:", opts: ["Vasectomy", "Tubectomy", "Castration", "Hysterectomy"], a: "Vasectomy" },
    { q: "The contractile unit of a muscle fiber between two successive Z-lines is called a:", opts: ["Sarcomere", "Sarcolemma", "Myofibril", "Sarcoplasm"], a: "Sarcomere" },
    { q: "During muscle contraction, the ion that binds to troponin to expose active actin sites is:", opts: ["Calcium (Ca²⁺)", "Sodium (Na⁺)", "Potassium (K⁺)", "Magnesium (Mg²⁺)"], a: "Calcium (Ca²⁺)" },
    { q: "Total number of bones in an adult human skeleton is:", opts: ["206", "208", "300", "196"], a: "206" },
    { q: "The largest and heaviest single bone in the human body is the:", opts: ["Femur (thigh bone)", "Tibia", "Humerus", "Pelvis"], a: "Femur (thigh bone)" },
    { q: "Which part of the human brain controls vital involuntary reflexes like breathing, heart rate, and vomiting?", opts: ["Medulla oblongata", "Cerebellum", "Hypothalamus", "Cerebrum"], a: "Medulla oblongata" },
    { q: "The primary center for homeostatic thermoregulation and thirst in human brain is:", opts: ["Hypothalamus", "Thalamus", "Pons varolii", "Cerebral cortex"], a: "Hypothalamus" },
    { q: "The sensory receptor cells of the human retina responsible for daylight and color vision are:", opts: ["Cones", "Rods", "Bipolar cells", "Ganglion cells"], a: "Cones" },
    { q: "Organ of Corti, the true sensory organ for hearing, rests upon the:", opts: ["Basilar membrane in cochlea", "Tectorial membrane", "Reissner's membrane", "Tympanic membrane"], a: "Basilar membrane in cochlea" },
    { q: "Which nitrogenous waste requires the maximum amount of water for excretion?", opts: ["Ammonia", "Urea", "Uric acid", "Creatinine"], a: "Ammonia" }
  ];

  const questions = [];

  // Physics (1 to 45)
  physics45.forEach(q => questions.push({ ...q, marks: 4 }));
  // Chemistry (46 to 90)
  chem45.forEach(q => questions.push({ ...q, marks: 4 }));
  // Botany (91 to 135)
  botanyQuestions.forEach(q => questions.push({ subject: "Botany", question: q.q, options: q.opts, correctAnswer: q.a, marks: 4 }));
  // Zoology (136 to 180)
  zoologyQuestions.forEach(q => questions.push({ subject: "Zoology", question: q.q, options: q.opts, correctAnswer: q.a, marks: 4 }));

  return questions;
}

// ==========================================
// 3. SEEDING INTO DATABASE
// ==========================================
async function seedFullGovernmentTests() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected successfully!");

    // 1. Seed or Update JEE Main
    console.log("Generating 135 Questions for JEE Main (45 Math, 45 Physics, 45 Chemistry)...");
    const jeeQuestions = getJeeMainQuestions();
    const jeeTest = await Test.findOneAndUpdate(
      { category: "JEE Mains" },
      {
        title: "JEE Main All India Mock Test 2026 (Mathematics, Physics & Chemistry)",
        category: "JEE Mains",
        className: "All",
        duration: 180,
        totalMarks: 135 * 4,
        passingPercentage: 40,
        difficulty: "Hard",
        year: "2026",
        description: "Official NTA CBT pattern mock test containing 45 Mathematics, 45 Physics, and 45 Chemistry questions. Time: 180 minutes. Full test experience with Section Tabs.",
        isPublished: true,
        questions: jeeQuestions
      },
      { upsert: true, new: true }
    );
    console.log("✅ JEE Main Test Saved! Total Questions:", jeeTest.questions.length);

    // 2. Seed or Update NEET UG
    console.log("Generating 180 Questions for NEET UG (45 Physics, 45 Chemistry, 45 Botany, 45 Zoology)...");
    const neetQuestions = getNeetQuestions();
    const neetTest = await Test.findOneAndUpdate(
      { category: "NEET" },
      {
        title: "NEET UG Grand Mock Test 2026 (Physics, Chemistry, Botany & Zoology)",
        category: "NEET",
        className: "All",
        duration: 200,
        totalMarks: 180 * 4,
        passingPercentage: 50,
        difficulty: "Hard",
        year: "2026",
        description: "Official NTA NEET pattern mock test containing 45 Physics, 45 Chemistry, 45 Botany, and 45 Zoology questions. Time: 200 minutes. 720 Marks.",
        isPublished: true,
        questions: neetQuestions
      },
      { upsert: true, new: true }
    );
    console.log("✅ NEET Test Saved! Total Questions:", neetTest.questions.length);

    // 3. Update Existing Class 9th, 10th, 11th, 12th Tests to assign subjects properly
    const allTests = await Test.find({ category: { $nin: ["JEE Mains", "NEET"] } });
    for (const test of allTests) {
      if (test.questions && test.questions.length > 0) {
        let changed = false;
        test.questions.forEach((q, idx) => {
          if (!q.subject || q.subject === "Unassigned") {
            const title = (test.title || '').toLowerCase();
            if (title.includes('physics') && title.includes('chemistry') && title.includes('math')) {
              const third = Math.ceil(test.questions.length / 3);
              if (idx < third) q.subject = "Mathematics";
              else if (idx < third * 2) q.subject = "Physics";
              else q.subject = "Chemistry";
            } else if (title.includes('physics') && title.includes('chemistry')) {
              const half = Math.ceil(test.questions.length / 2);
              q.subject = idx < half ? "Physics" : "Chemistry";
            } else if (title.includes('math')) {
              q.subject = "Mathematics";
            } else if (title.includes('science')) {
              q.subject = "General Science";
            } else {
              q.subject = "Core Subject";
            }
            changed = true;
          }
        });
        if (changed) {
          await test.save();
          console.log(`Updated subject tags for: ${test.title}`);
        }
      }
    }

    console.log("\n==========================================");
    console.log("ALL GOVERNMENT PATTERN TESTS SEEDED SUCCESSFULLY!");
    console.log("==========================================");

  } catch (err) {
    console.error("Error seeding tests:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedFullGovernmentTests();
