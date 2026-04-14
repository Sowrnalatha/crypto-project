import os
from Crypto.Cipher import AES
from Crypto.Hash import SHA256

def get_key(password):
    return SHA256.new(password.encode()).digest()

def decrypt_file(filename, password):
    key = get_key(password)

    with open(filename, 'rb') as f:
        nonce = f.read(16)
        tag = f.read(16)
        ciphertext = f.read()

    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)

    try:
        data = cipher.decrypt_and_verify(ciphertext, tag)

        # Proper output filename
        original_name = filename[:-4]  # remove .enc
        output_file = "decrypted_" + os.path.basename(original_name)

        with open(output_file, 'wb') as f:
            f.write(data)

        return output_file

    except Exception as e:
        print("Error:", e)
        return None