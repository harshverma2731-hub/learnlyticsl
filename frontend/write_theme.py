import os

# 1. Update Tailwind Config with Pink Brand Colors
tailwind_config = '''/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          900: '#831843',
        }
      }
    },
  },
  plugins: [],
}
'''

with open('tailwind.config.js', 'w', encoding='utf-8') as f:
    f.write(tailwind_config)
    print("✅ Updated tailwind.config.js with Pink Theme")

# 2. Update Student Profile with Pink Accents
profile_path = 'src/StudentProfile.tsx'
with open(profile_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace dark slate simulator with deep pink
content = content.replace('bg-slate-800 text-white', 'bg-brand-900 text-white')
# Replace simulator slider accents
content = content.replace('text-brand-400', 'text-brand-100')
content = content.replace('accent-brand-500', 'accent-brand-400')
# Make heatmap cells pink instead of emerald
content = content.replace('bg-emerald-200', 'bg-brand-100')
content = content.replace('bg-emerald-400', 'bg-brand-400')
content = content.replace('bg-emerald-500', 'bg-brand-500')
content = content.replace('bg-emerald-600', 'bg-brand-600')
# Update loading state text
content = content.replace('text-slate-500', 'text-brand-500')

with open(profile_path, 'w', encoding='utf-8') as f:
    f.write(content)
    print("✅ Updated StudentProfile.tsx to Pink Theme")

# 3. Update Dashboard with Pink Accents
dashboard_path = 'src/Dashboard.tsx'
with open(dashboard_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update status badge colors (Safe = pink, Watch = amber, High Risk = red)
content = content.replace("return 'bg-emerald-100 text-emerald-700 border-emerald-200';", "return 'bg-brand-100 text-brand-900 border-brand-200';")
# Update progress bar colors
content = content.replace(": 'bg-emerald-500'", ": 'bg-brand-500'")
# Update hover text
content = content.replace('hover:text-brand-900', 'hover:text-brand-900')

with open(dashboard_path, 'w', encoding='utf-8') as f:
    f.write(content)
    print("✅ Updated Dashboard.tsx to Pink Theme")

print("\n🎉 Pink Theme applied! Restart your frontend.")