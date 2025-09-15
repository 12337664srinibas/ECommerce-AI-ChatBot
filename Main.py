import openai
openai.api_key = "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"
def chat_with_gpt(Prompt):
 response = openai.ChatCompletion.create(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": Prompt}]
)

 return response.choices[0].message.content.strip()
if __name__ == "__main__":
   while True: 
    user_input = input("you: ")
    if user_input.lower() in ["Quit" , "Exit" , "Bye"]:
          break
    response = chat_with_gpt(user_input)
    print("Chatbot: " , response)