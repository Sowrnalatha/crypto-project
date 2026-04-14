import tkinter as tk
from tkinter import filedialog, messagebox
from encrypt import encrypt_file
from decrypt import decrypt_file

selected_file = ""

def choose_file():
    global selected_file
    selected_file = filedialog.askopenfilename()
    file_label.config(text=selected_file)

def encrypt_action():
    if not selected_file:
        messagebox.showerror("Error", "Please select a file!")
        return

    password = password_entry.get()
    if not password:
        messagebox.showerror("Error", "Please enter password!")
        return

    output = encrypt_file(selected_file, password)
    messagebox.showinfo("Success", f"Encrypted file saved as:\n{output}")

def decrypt_action():
    if not selected_file:
        messagebox.showerror("Error", "Please select a file!")
        return

    password = password_entry.get()
    if not password:
        messagebox.showerror("Error", "Please enter password!")
        return

    output = decrypt_file(selected_file, password)

    if output:
        messagebox.showinfo("Success", f"Decrypted file saved as:\n{output}")
    else:
        messagebox.showerror("Error", "Wrong password or corrupted file!")

# GUI Setup
root = tk.Tk()
root.title("AES-256 File Encryption Tool")
root.geometry("500x300")

tk.Label(root, text="AES-256 Secure File Locker", font=("Arial", 14, "bold")).pack(pady=10)

tk.Button(root, text="Select File", command=choose_file).pack(pady=5)

file_label = tk.Label(root, text="No file selected", wraplength=400)
file_label.pack(pady=5)

tk.Label(root, text="Enter Password:").pack(pady=5)
password_entry = tk.Entry(root, show="*", width=30)
password_entry.pack(pady=5)

tk.Button(root, text="Encrypt", bg="green", fg="white", command=encrypt_action).pack(pady=5)
tk.Button(root, text="Decrypt", bg="blue", fg="white", command=decrypt_action).pack(pady=5)

root.mainloop()
