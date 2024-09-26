//PASTE THE CODE INTO THE SCRIPTABLE APP

//MAKE SURE TO USE YOUR OWN NOTION API TOKEN

//GET THE CORRECT DATABASE_ID. USED A SIMPLE TABLE WITH NAME, AMOUNT, CATEGORY and DATE COLUMNS
//MAKE NECESSARY CHANGES IN CODE IF YOU CHANGE ORDER OR NAMES OF THE COLUMNS

// Replace with your Notion integration token and database ID
const NOTION_API_TOKEN = "";
const DATABASE_ID = ""; //Plenty of videos and resources to get your database id

async function addExpense(description, amount, category, date) {
  let url = `https://api.notion.com/v1/pages`;
  let payload = {
    parent: { database_id: DATABASE_ID },
    properties: {
      Name: { title: [{ text: { content: description } }] },
      Amount: { number: parseFloat(amount) },
      Category: { select: { name: category } },
      Date: { date: { start: date } }
    }
  };

  let request = new Request(url);
  request.method = "POST";
  request.headers = {
    "Authorization": `Bearer ${NOTION_API_TOKEN}`,
    "Content-Type": "application/json",
    "Notion-Version": "2021-05-13"
  };
  request.body = JSON.stringify(payload);

  try {
    let response = await request.loadJSON();
    console.log(response);  // Log the response for debugging
    return response;
  } catch (error) {
    console.error(error);  // Log any errors for debugging
    return null;
  }
}

async function main() {
  if (config.runsInApp) {
    // Adding Expense
    let alert = new Alert();
    alert.title = "Add Expense";
    alert.addTextField("Description");
    alert.addTextField("Amount");
    alert.addTextField("Category");
    alert.addTextField("Date (YYYY-MM-DD)", new Date().toISOString().split('T')[0]);

    alert.addAction("Add");
    alert.addCancelAction("Cancel");

    let response = await alert.present();
    if (response === -1) return;

    let description = alert.textFieldValue(0);
    let amount = alert.textFieldValue(1);
    let category = alert.textFieldValue(2);
    let date = alert.textFieldValue(3);

    if (!description || !amount || isNaN(amount) || !date) {
      let errorAlert = new Alert();
      errorAlert.title = "Invalid Input";
      errorAlert.message = "Please provide valid expense details.";
      errorAlert.addAction("OK");
      await errorAlert.present();
      return;
    }

    let result = await addExpense(description, amount, category, date);
    if (result) {
      Keychain.set("lastExpense", JSON.stringify({ description, amount, category, date }));
    } else {
      Keychain.remove("lastExpense");
    }
  }

  if (config.runsInWidget) {
    // Displaying Static Text in Widget
    let widget = new ListWidget();
    widget.backgroundColor = new Color("#ffffff");

    let titleFont = new Font("HelveticaNeue-Medium", 14);
    let blackColor = new Color("#000000");

    widget.addText("Quick Add - Budget Tracker").font = titleFont;
    widget.addSpacer();

    Script.setWidget(widget);
    widget.presentMedium();
  }
}

await main();
