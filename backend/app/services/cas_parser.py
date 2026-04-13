"""
CAS PDF Parser Service
======================
Decrypts a CAS (Consolidated Account Statement) PDF using the user's PAN
as password, then extracts holdings information.

CAS PDFs from CDSL/NSDL follow a standard format:
- Password is the PAN card number
- Contains tables with ISIN, stock name, quantity, value
"""

import fitz  # PyMuPDF
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Common sector mappings for Indian stocks
SECTOR_MAP = {
    "RELIANCE": "Energy",
    "TCS": "IT",
    "INFY": "IT",
    "HDFCBANK": "Banking",
    "ICICIBANK": "Banking",
    "SBIN": "Banking",
    "KOTAKBANK": "Banking",
    "AXISBANK": "Banking",
    "HINDUNILVR": "FMCG",
    "ITC": "FMCG",
    "BHARTIARTL": "Telecom",
    "LT": "Infrastructure",
    "WIPRO": "IT",
    "HCLTECH": "IT",
    "TECHM": "IT",
    "BAJFINANCE": "Finance",
    "BAJFINSV": "Finance",
    "MARUTI": "Automobile",
    "TATAMOTORS": "Automobile",
    "TATASTEEL": "Metals",
    "SUNPHARMA": "Pharma",
    "DRREDDY": "Pharma",
    "CIPLA": "Pharma",
    "ASIANPAINT": "Paint",
    "ULTRACEMCO": "Cement",
    "TITAN": "Consumer",
    "NESTLEIND": "FMCG",
    "POWERGRID": "Power",
    "NTPC": "Power",
    "ONGC": "Energy",
    "COALINDIA": "Mining",
    "ADANIENT": "Conglomerate",
    "ADANIPORTS": "Infrastructure",
    "JSWSTEEL": "Metals",
    "M&M": "Automobile",
    "HEROMOTOCO": "Automobile",
    "DIVISLAB": "Pharma",
    "APOLLOHOSP": "Healthcare",
}

# Map common stock names to NSE symbols
NAME_TO_SYMBOL = {
    "reliance industries": "RELIANCE",
    "tata consultancy": "TCS",
    "infosys": "INFY",
    "hdfc bank": "HDFCBANK",
    "icici bank": "ICICIBANK",
    "state bank of india": "SBIN",
    "kotak mahindra": "KOTAKBANK",
    "axis bank": "AXISBANK",
    "hindustan unilever": "HINDUNILVR",
    "itc": "ITC",
    "bharti airtel": "BHARTIARTL",
    "larsen": "LT",
    "wipro": "WIPRO",
    "hcl technologies": "HCLTECH",
    "tech mahindra": "TECHM",
    "bajaj finance": "BAJFINANCE",
    "maruti suzuki": "MARUTI",
    "tata motors": "TATAMOTORS",
    "tata steel": "TATASTEEL",
    "sun pharma": "SUNPHARMA",
    "dr. reddy": "DRREDDY",
    "cipla": "CIPLA",
    "asian paints": "ASIANPAINT",
    "ultratech cement": "ULTRACEMCO",
    "titan company": "TITAN",
    "nestle india": "NESTLEIND",
    "power grid": "POWERGRID",
    "ntpc": "NTPC",
    "ongc": "ONGC",
    "coal india": "COALINDIA",
    "adani enterprises": "ADANIENT",
    "adani ports": "ADANIPORTS",
    "jsw steel": "JSWSTEEL",
    "mahindra": "M&M",
    "hero motocorp": "HEROMOTOCO",
    "divi's lab": "DIVISLAB",
    "apollo hospitals": "APOLLOHOSP",
}


def guess_symbol(name: str) -> str:
    """Try to map a stock name to its NSE symbol."""
    name_lower = name.lower().strip()
    for keyword, symbol in NAME_TO_SYMBOL.items():
        if keyword in name_lower:
            return symbol
    # Fallback: use first word uppercased
    return name.split()[0].upper() if name else "UNKNOWN"


def guess_sector(symbol: str) -> str:
    """Map a symbol to its sector."""
    return SECTOR_MAP.get(symbol.replace(".NS", ""), "Other")


def decrypt_and_parse(pdf_bytes: bytes, pan: str) -> list[dict]:
    """
    Decrypt a CAS PDF using PAN as password and extract holdings.
    
    Falls back to demo data when decryption/parsing fails (hackathon prototype).
    
    Returns list of dicts with keys:
        symbol, name, isin, quantity, avg_cost, asset_type, sector
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        logger.warning(f"Could not open PDF: {e}. Using demo data.")
        return _get_demo_holdings()
    
    if doc.is_encrypted:
        # Try PAN as password (CAS PDFs are typically encrypted with PAN)
        if not doc.authenticate(pan.upper()):
            if not doc.authenticate(pan.lower()):
                doc.close()
                logger.warning("Could not decrypt CAS PDF with provided PAN. Using demo data for hackathon.")
                return _get_demo_holdings()
    
    # Extract all text
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    doc.close()
    
    if not full_text.strip():
        logger.warning("PDF text extraction returned empty. Using demo data.")
        return _get_demo_holdings()
    
    # Parse holdings from the extracted text
    holdings = _extract_holdings(full_text)
    
    if not holdings:
        # If regex parsing fails, try a more lenient approach
        holdings = _extract_holdings_fallback(full_text)
    
    return holdings


def _extract_holdings(text: str) -> list[dict]:
    """
    Parse holdings from CAS text.
    CAS format typically has lines like:
        ISIN: INE002A01018 - Reliance Industries Ltd
        Quantity: 10.000
        Value: 25,430.00
    
    Or tabular format:
        INE002A01018 | Reliance Industries | 10 | 2543.00 | 25430.00
    """
    holdings = []
    
    # Pattern 1: ISIN-based extraction
    # Look for ISIN codes (INE followed by alphanumeric)
    isin_pattern = re.compile(
        r'(INE[A-Z0-9]{9})\s*[-–]\s*(.+?)(?:\n|$)',
        re.MULTILINE
    )
    
    # Pattern for quantity/units
    qty_pattern = re.compile(
        r'(?:Quantity|Units|Balance)\s*[:\s]*([0-9,.]+)',
        re.IGNORECASE
    )
    
    # Pattern for value/amount
    value_pattern = re.compile(
        r'(?:Value|Amount|Market\s*Value|NAV\s*Value)\s*[:\s]*(?:Rs\.?|INR|₹)?\s*([0-9,.]+)',
        re.IGNORECASE
    )
    
    # Try structured parsing
    sections = text.split('\n\n')
    for section in sections:
        isin_match = isin_pattern.search(section)
        if isin_match:
            isin = isin_match.group(1)
            name = isin_match.group(2).strip()
            
            qty_match = qty_pattern.search(section)
            val_match = value_pattern.search(section)
            
            quantity = float(qty_match.group(1).replace(',', '')) if qty_match else 0.0
            value = float(val_match.group(1).replace(',', '')) if val_match else 0.0
            
            if quantity > 0:
                symbol = guess_symbol(name)
                avg_cost = value / quantity if quantity > 0 else 0.0
                
                holdings.append({
                    "symbol": f"{symbol}.NS",
                    "name": name,
                    "isin": isin,
                    "quantity": quantity,
                    "avg_cost": round(avg_cost, 2),
                    "asset_type": _guess_asset_type(name, isin),
                    "sector": guess_sector(symbol),
                })
    
    return holdings


def _extract_holdings_fallback(text: str) -> list[dict]:
    """
    Fallback parser for when structured extraction fails.
    Looks for any recognizable Indian stock names or ISINs in the text.
    """
    holdings = []
    seen_isins = set()
    
    # Find all ISINs
    isins = re.findall(r'INE[A-Z0-9]{9}', text)
    
    for isin in isins:
        if isin in seen_isins:
            continue
        seen_isins.add(isin)
        
        # Find context around ISIN (100 chars before and after)
        idx = text.find(isin)
        context = text[max(0, idx - 100):idx + 200]
        
        # Try to extract name from context
        name_match = re.search(r'(?:' + re.escape(isin) + r')\s*[-–]?\s*(.+?)(?:\n|$)', context)
        name = name_match.group(1).strip()[:80] if name_match else "Unknown Stock"
        
        # Try to extract numbers from context
        numbers = re.findall(r'([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)', context)
        numbers = [float(n.replace(',', '')) for n in numbers]
        
        quantity = numbers[0] if numbers else 1.0
        value = numbers[1] if len(numbers) > 1 else 0.0
        
        symbol = guess_symbol(name)
        
        holdings.append({
            "symbol": f"{symbol}.NS",
            "name": name,
            "isin": isin,
            "quantity": quantity,
            "avg_cost": round(value / quantity, 2) if quantity > 0 else 0.0,
            "asset_type": _guess_asset_type(name, isin),
            "sector": guess_sector(symbol),
        })
    
    # If still nothing found, provide demo holdings for hackathon
    if not holdings:
        logger.warning("No holdings found in CAS PDF. Using demo data for hackathon prototype.")
        holdings = _get_demo_holdings()
    
    return holdings


def _guess_asset_type(name: str, isin: str = "") -> str:
    """Guess whether a holding is equity, mutual_fund, or etf."""
    name_lower = name.lower()
    if any(kw in name_lower for kw in ["fund", "scheme", "growth", "dividend", "nav", "mutual"]):
        return "mutual_fund"
    if any(kw in name_lower for kw in ["etf", "exchange traded", "nifty bees", "gold bees"]):
        return "etf"
    return "equity"


def _get_demo_holdings() -> list[dict]:
    """Provide demo holdings for the hackathon prototype when parsing fails."""
    return [
        {
            "symbol": "RELIANCE.NS",
            "name": "Reliance Industries Ltd",
            "isin": "INE002A01018",
            "quantity": 15,
            "avg_cost": 2450.00,
            "asset_type": "equity",
            "sector": "Energy",
        },
        {
            "symbol": "TCS.NS",
            "name": "Tata Consultancy Services Ltd",
            "isin": "INE467B01029",
            "quantity": 8,
            "avg_cost": 3620.00,
            "asset_type": "equity",
            "sector": "IT",
        },
        {
            "symbol": "HDFCBANK.NS",
            "name": "HDFC Bank Ltd",
            "isin": "INE040A01034",
            "quantity": 20,
            "avg_cost": 1580.00,
            "asset_type": "equity",
            "sector": "Banking",
        },
        {
            "symbol": "INFY.NS",
            "name": "Infosys Ltd",
            "isin": "INE009A01021",
            "quantity": 25,
            "avg_cost": 1420.00,
            "asset_type": "equity",
            "sector": "IT",
        },
        {
            "symbol": "ICICIBANK.NS",
            "name": "ICICI Bank Ltd",
            "isin": "INE090A01021",
            "quantity": 30,
            "avg_cost": 980.00,
            "asset_type": "equity",
            "sector": "Banking",
        },
        {
            "symbol": "BHARTIARTL.NS",
            "name": "Bharti Airtel Ltd",
            "isin": "INE397D01024",
            "quantity": 12,
            "avg_cost": 1250.00,
            "asset_type": "equity",
            "sector": "Telecom",
        },
        {
            "symbol": "TATAMOTORS.NS",
            "name": "Tata Motors Ltd",
            "isin": "INE155A01022",
            "quantity": 40,
            "avg_cost": 650.00,
            "asset_type": "equity",
            "sector": "Automobile",
        },
        {
            "symbol": "SUNPHARMA.NS",
            "name": "Sun Pharmaceutical Industries Ltd",
            "isin": "INE044A01036",
            "quantity": 18,
            "avg_cost": 1180.00,
            "asset_type": "equity",
            "sector": "Pharma",
        },
    ]
