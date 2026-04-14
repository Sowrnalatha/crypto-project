import os
from Crypto.Cipher import AES
from Crypto.Hash import SHA256

def get_key(password):
    return SHA256.new(password.encode()).digest()

def encrypt_file(filename, password):
    key = get_key(password)

    with open(filename, 'rb') as f:
        data = f.read()

    cipher = AES.new(key, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(data)

    # save inside crypto folder
    output_file = os.path.basename(filename) + ".enc"

    with open(output_file, 'wb') as f:
        f.write(cipher.nonce)
        f.write(tag)
        f.write(ciphertext)

    return output_file